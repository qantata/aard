import fs from "fs";
import path from "path";

import { DATABASE_URL } from "../src/server/utils/constants";

(() => {
  const env = `NODE_ENV=production`;
  const dbUrl = `DATABASE_URL=file:${DATABASE_URL}`;
  const prismaMigrationBin = `PRISMA_MIGRATION_ENGINE_BINARY=lib/migration-engine-debian-openssl-1.1.x`;
  const prismaLibqueryBin = `PRISMA_QUERY_ENGINE_LIBRARY=lib/libquery_engine-debian-openssl-1.1.x.so.node`;

  const str = `${env}\n${dbUrl}\n${prismaMigrationBin}\n${prismaLibqueryBin}\n`;

  fs.writeFileSync(path.join(process.cwd(), ".env"), str, {});
})();

export {};
