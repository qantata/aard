import * as dotenv from "dotenv";

import { DATABASE_URL, IS_DEV, IS_PKG } from "@/utils/constants";

export default function () {
  // Need to set here and not .env file because it uses os.homedir()
  process.env.DATABASE_URL = `file:${DATABASE_URL}`;

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

  return {
    ...process.env,
  };
}
