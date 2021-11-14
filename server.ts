import next from "next";
import express from "express";
import { Migrate } from "@prisma/migrate";
import { ApolloServer } from "apollo-server-express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import path from "path";
import fse from "fs-extra";
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

/*
 * This is a hack and isn't officially supported by prisma.
 * This is the only way that we can migrate right now, because
 * we cannot run prisma commands against our database since the installed
 * app doesn't have access to any commands (it's just a packaged executable).
 * TODO: Replace this once an official solution is created
 * https://github.com/prisma/prisma/issues/4703
 */
const migrateDb = async () => {
  const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");

  const migrate = new Migrate(schemaPath);
  await fse.ensureFile(process.env.DATABASE_URL_PATH!);

  const diagnose = await migrate.diagnoseMigrationHistory({
    optInToShadowDatabase: false,
  });
  if (diagnose.history?.diagnostic === "databaseIsBehind") {
    console.log("Database is behind, need to apply migrations");
  }

  const result = await migrate.applyMigrations();
  if (result.appliedMigrationNames.length > 0) {
    console.log(`Applied ${result.appliedMigrationNames.length} migrations`);
  }

  migrate.stop();
};

(function () {
  /*
   * Another hack to make spawn calls work with pkg.
   * This is needed because child_process.spawn() fails if
   * the cwd path doesn't exist on the file system. For some reason
   * when that value is a path to the virtual file system that pkg creates
   * (e.g. /snapshot/aard/...), spawn() thinks it doesn't exist and throws
   * an ENOENT error. This means that the prisma migrate script cannot call
   * the migration engine binary unless we set the cwd value to be outside of
   * the pkg virtual filesystem, and in this case we set it to process.cwd(),
   * which is the directory where the aard binary is located.
   * https://github.com/vercel/pkg/issues/342
   * https://github.com/prisma/prisma/issues/8449
   */
  var childProcess = require("child_process");
  var oldSpawn = childProcess.spawn;
  function spawn() {
    let x = arguments;
    x["2"]["cwd"] = process.cwd();
    var result = oldSpawn.apply(this, x);
    return result;
  }
  childProcess.spawn = spawn;

  nextApp.prepare().then(async () => {
    // Migrate database to latest version when running in prod
    if (!dev) {
      await migrateDb();
    }

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
})();
