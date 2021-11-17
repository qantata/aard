import dotenv from "dotenv";

import { DEV, IS_PKG } from "./constants";

// Loads environment files
const config = () => {
  const BASE = IS_PKG ? "/snapshot/aard" : ".";

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
