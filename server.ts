import http from "http";
import next from "next";
import express from "express";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

nextApp.prepare().then(async () => {
  const app = express();
  const server = http.createServer(app);

  // Handle all paths as valid routes except for /data/*
  app.get(/^\/(?!(data)).*/, (req, res, next) => {
    try {
      nextApp.render(req, res, "/");
    } catch (e) {
      next(e);
    }
  });

  const PORT = 5005;
  server.listen(PORT, () => {
    console.log(`🚀 Server ready at :${PORT}`);
  });
});
