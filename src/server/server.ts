// Run some setups
import env from "./utils/env";
env.config();

import binaryHack from "./utils/binary-hack";
binaryHack();

// App starts here
import fs from "fs";
import path from "path";
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

const createServer = async () => {
  applyPrismaMiddleware();

  if (!DEV) {
    await migrateDb();
  }

  // Main server
  const app = express();

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
        file: true,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      res.sendFile(movie.file.path);
    }
  });

  // Movie covers. TODO: Move elsewhere or else this method is going to be way too long
  app.get("/data/movies/:id/cover", async (req, res) => {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        file: true,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      // TODO: Improve this lol
      let filepath = movie.file.path;
      const b = path.basename(filepath);
      const possibilities = [
        filepath.replace(".mp4", ".jpg"),
        filepath.replace(b, b.toLocaleLowerCase().replace(".mp4", ".jpg")),
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
  });
};

createServer();
