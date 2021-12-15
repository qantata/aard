import fs from "fs";
import path from "path";

(() => {
  const env = `NODE_ENV=production`;
  const version = `AARD_VERSION=${process.env.AARD_NEXT_VERSION}`;
  const prismaBin = `PRISMA_MIGRATION_ENGINE_BINARY=./lib/migration-engine-debian-openssl-1.1.x`;
  const noPeerDepCheck = `NO_PEER_DEPENDENCY_CHECK=true`;

  const str = `${env}\n${version}\n${prismaBin}\n${noPeerDepCheck}\n`;

  fs.writeFileSync(path.join(process.cwd(), ".env"), str, {});
})();

export {};
