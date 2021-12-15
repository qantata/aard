import dotenv from "dotenv";

import { DATABASE_URL, DEV, IS_PKG } from "./constants";

// Loads environment files
const config = () => {
  // Need to set here and not .env file because it uses os.homedir()
  process.env.DATABASE_URL = `file:${DATABASE_URL}`;

  const BASE = IS_PKG ? "/snapshot/aard/apps/server" : ".";

  dotenv.config({
    path: `${BASE}/.env`,
  });

  if (DEV) {
    dotenv.config({
      path: `${BASE}/.env.development`,
    });

    dotenv.config({
      path: `${BASE}/.env.development.local`,
    });
  } else {
    dotenv.config({
      path: `${BASE}/.env.production`,
    });

    dotenv.config({
      path: `${BASE}/.env.production.local`,
    });
  }
};

export default {
  config,
};
