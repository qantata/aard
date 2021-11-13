import next from "next";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import path from "path";
import fs from "fs";

import { context } from "./src/context";
import { schema } from "./src/schema/schema";
import { applyPrismaMiddleware } from "./src/middleware";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({
  dev,
  conf: {
    reactStrictMode: true,
    useFileSystemPublicRoutes: false,
    experimental: {
      reactRoot: true,
    },
  },
});
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app = express();
  const server = new ApolloServer({
    context,
    schema,
  });

  await server.start();
  server.applyMiddleware({ app });
  applyPrismaMiddleware();

  // Needed for next hmr to work
  app.all("/_next/webpack-hmr", async (req: any, res: any) => {
    handle(req, res);
  });

  // Handle all paths as valid routes except for /data/*
  app.get(/^\/(?!(data)).*/, (req, res, next) => {
    try {
      nextApp.render(req, res, "/");
    } catch (e) {
      next(e);
    }
  });

  // Movie video file
  app.get("/data/movies/:id/video", async (req, res) => {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      res.sendFile(movie.filepath);
    }
  });

  // Movie covers. TODO: Move elsewhere or else this method is going to be way too long
  app.get("/data/movies/:id/cover", async (req, res) => {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!movie) {
      res.status(404).send();
    } else {
      // TODO: Improve this lol
      const b = path.basename(movie.filepath);
      const possibilities = [
        movie.filepath.replace(".mp4", ".jpg"),
        movie.filepath.replace(
          b,
          b.toLocaleLowerCase().replace(".mp4", ".jpg")
        ),
        movie.filepath.replace(b, "Cover.jpg"),
        movie.filepath.replace(b, "cover.jpg"),
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
      // @ts-ignore
      server: app,
      path: server.graphqlPath,
    }
  );

  const PORT = 5005;
  app.listen(PORT, () => {
    console.log(`> Server ready at :${PORT}`);

    if (dev) {
      console.log(
        `> Queries ready at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `> Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`
      );
    }
  });
});
