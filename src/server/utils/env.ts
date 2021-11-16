import dotenv from "dotenv";

// Loads environment files
const config = () => {
  dotenv.config({
    path: ".env",
  });

  if (process.env.NODE_ENV === "development") {
    dotenv.config({
      path: ".env.development",
    });

    dotenv.config({
      path: ".env.development.local",
    });
  } else {
    dotenv.config({
      path: ".env.production",
    });

    dotenv.config({
      path: ".env.production.local",
    });
  }
};

export default {
  config,
};
