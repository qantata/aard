import { forwardRef, INestApplication, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Migrate } from "@prisma/migrate";
import { PrismaClient } from ".prisma/client";
import * as path from "path";
import * as fse from "fs-extra";

import { Env } from "@/config/env";
import { Library } from "@lib/nexus-prisma";
import { LibraryService } from "@/library/library.service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    private config: ConfigService<Env>,
    @Inject(forwardRef(() => LibraryService)) private libraryService: LibraryService
  ) {
    super({
      log: process.env.DEBUG !== undefined ? ["query"] : undefined,
      datasources: {
        db: {
          url: `file:${config.get("DATABASE_URL", { infer: true })}`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.applyMiddleware();
  }

  private async applyMiddleware() {
    this.$use(async (params, next) => {
      const result = await next(params);

      if (params.model === Library.$name && params.action === "create") {
        this.libraryService.scan(params.args.data.id, params.args.data.root);
      }

      return result;
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }

  /*
   * This is a hack and isn't officially supported by prisma.
   * This is the only way that we can migrate right now, because
   * we cannot run prisma commands against our database since the installed
   * app doesn't have access to any commands (it's just a packaged executable).
   * TODO: Replace this once an official solution is created
   * https://github.com/prisma/prisma/issues/4703
   */
  async migrate() {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

    const DATABASE_PATH = this.config.get("DATABASE_PATH", {
      infer: true,
    });

    const migrate = new Migrate(schemaPath);
    await fse.ensureFile(DATABASE_PATH);

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
  }
}
