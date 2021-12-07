// Run some setups
import env from "./utils/env";
env.config();

import binaryHack from "./utils/binary-hack";
binaryHack();

// App starts here
import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";
import { createServer as createViteServer } from "vite";
import { ApolloServer } from "apollo-server-express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

import { context } from "./context";
import { schema } from "./schema/schema";
import { applyPrismaMiddleware } from "./middleware";
import { DEV, VERSION } from "./utils/constants";
import { migrateDb } from "./utils/migrate-db";
import { updateFfmpegCache } from "./utils/ffmpeg-cache";
import { handleStreamSegmentRequest } from "./utils/transcode-manager";
import { getSessionStreamPath } from "./utils/paths";
import { parseProbeDataString } from "./utils/ffprobe-transformer";

const createServer = async () => {
  applyPrismaMiddleware();
  await updateFfmpegCache();

  if (!DEV) {
    await migrateDb();
  }

  // Main server
  const app = express();
  app.use(cors());

  // Apollo server for graphql
  const server = new ApolloServer({
    context,
    schema,
  });
  await server.start();
  server.applyMiddleware({ app });

  // Vite server
  const vite = await createViteServer({
    server: {
      // Need proxy so we can have a reachable API (Vite uses all the routes)
      proxy: {
        "/data": {
          target: "http://localhost:5004",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  });

  // Movie video file
  app.get("/data/movies/:id/video", async (req, res) => {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        files: true,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      res.sendFile(movie.files[0].path);
    }
  });

  // Movie covers. TODO: Move elsewhere or else this method is going to be way too long
  app.get("/data/movies/:id/cover", async (req, res) => {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        files: true,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      // TODO: Improve this lol
      let filepath = movie.files[0].path;
      const b = path.basename(filepath);
      const possibilities = [
        filepath.replace(path.extname(filepath), ".jpg"),
        filepath.replace(b, b.toLocaleLowerCase().replace(path.extname(filepath), ".jpg")),
        filepath.replace(b, "Cover.jpg"),
        filepath.replace(b, "cover.jpg"),
      ];

      for (const p of possibilities) {
        if (fs.existsSync(p)) {
          return res.sendFile(p);
        }
      }

      res.status(404).send();
    }
  });

  app.get("/data/session/:id/direct", async (req, res) => {
    const session = await context().prisma.videoStreamSession.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        file: true,
      },
    });

    if (!session) {
      res.status(404).send();
    } else {
      res.sendFile(session.file.path);
    }
  });

  app.get("/data/session/:sessionid/stream/:streamid/:file", async (req, res) => {
    const session = await context().prisma.videoStreamSession.findUnique({
      where: {
        id: req.params.sessionid,
      },
      include: {
        file: true,
        clients: {
          include: {
            profiles: true,
          },
        },
      },
    });

    const profile = session?.clients[0].profiles.find((p) => p.id === req.params.streamid);

    if (!session || !profile) {
      res.status(404).send();
    } else {
      if (req.params.file.endsWith(".m3u8")) {
        res.sendFile(getSessionStreamPath(session.id, profile.id, req.params.file));
        return;
      }

      // Wait for segment to be transcoded
      await handleStreamSegmentRequest(
        session.file.path,
        session.id,
        profile.id,
        req.params.file,
        parseProbeDataString(session.file.probeData)
      );

      const segmentFilepath = getSessionStreamPath(session.id, profile.id, req.params.file);
      if (fs.existsSync(segmentFilepath)) {
        res.sendFile(segmentFilepath);
      } else {
        res.status(404).send();
      }
    }
  });

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      // @ts-ignore TODO: stupid ws
      server: app,
      path: server.graphqlPath,
    }
  );

  const EXPRESS_PORT = 5004;
  const VITE_PORT = 5005;
  await vite.listen(VITE_PORT);
  app.listen(EXPRESS_PORT, () => {
    console.log(`> Aard version ${VERSION()} ready at http://localhost:${VITE_PORT}`);

    if (DEV) {
      console.log(`> Queries ready at http://localhost:${EXPRESS_PORT}${server.graphqlPath}`);
      console.log(`> Subscriptions ready at ws://localhost:${EXPRESS_PORT}${server.graphqlPath}`);
    }

    console.log();
  });
};

createServer();
