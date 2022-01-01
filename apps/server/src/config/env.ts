import * as dotenv from "dotenv";
import * as path from "path";
import * as os from "os";

export default function () {
  const IS_PKG = (<any>process).pkg !== undefined;
  const IS_DEV = process.env.NODE_ENV === "development";

  const BASE = IS_PKG ? "/snapshot/aard/apps/server" : ".";

  dotenv.config({
    path: `${BASE}/.env`,
  });

  if (IS_DEV) {
    dotenv.config({
      path: `${BASE}/.env.development`,
    });

    dotenv.config({
      path: `${BASE}/.env.development.local`,
    });

    dotenv.config({
      path: `${BASE}/prisma/.env.development`,
    });

    dotenv.config({
      path: `${BASE}/prisma/.env.development.local`,
    });
  } else {
    dotenv.config({
      path: `${BASE}/.env.production`,
    });

    dotenv.config({
      path: `${BASE}/.env.production.local`,
    });

    dotenv.config({
      path: `${BASE}/prisma/.env.production`,
    });

    dotenv.config({
      path: `${BASE}/prisma/.env.production.local`,
    });
  }

  const DATA_DIR = path.join(os.homedir(), ".aard");
  const DATABASE_PATH = path.join(DATA_DIR, IS_DEV ? "dev.db" : "database.db");

  const computed = {
    IS_PKG,
    IS_DEV,
    DATA_DIR,
    DATABASE_PATH,
    DATABASE_URL: `file:${DATABASE_PATH}`,
    PKG_SERVER_DIR: "/snapshot/aard/apps/server",
    version: process.env.AARD_VERSION !== undefined ? process.env.AARD_VERSION : "UNKNOWN",
  };

  return {
    ...computed,
    ...process.env,
  };
}
