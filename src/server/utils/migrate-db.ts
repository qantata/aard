import path from "path";
import fse from "fs-extra";
import { Migrate } from "@prisma/migrate";

import { DATABASE_URL } from "./constants";

/*
 * This is a hack and isn't officially supported by prisma.
 * This is the only way that we can migrate right now, because
 * we cannot run prisma commands against our database since the installed
 * app doesn't have access to any commands (it's just a packaged executable).
 * TODO: Replace this once an official solution is created
 * https://github.com/prisma/prisma/issues/4703
 */
export const migrateDb = async () => {
  const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");

  const migrate = new Migrate(schemaPath);
  await fse.ensureFile(DATABASE_URL);

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
