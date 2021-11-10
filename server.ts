import next from "next";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

import { context } from "./src/context";
import { schema } from "./src/schema/schema";
import { applyPrismaMiddleware } from "./src/middleware";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
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

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: app,
      path: server.graphqlPath,
    }
  );

  const PORT = 5005;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at :${PORT}`);
    console.log(
      `🚀 Queries ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
});
