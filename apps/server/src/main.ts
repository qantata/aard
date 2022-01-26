import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
        ? ["log", "error", "warn", "debug"]
        : ["error", "warn"],
  });
  app.enableCors();

  const EXPRESS_PORT = 5004;
  app.listen(EXPRESS_PORT, () => {
    console.log(`\n> Server ready at http://localhost:${EXPRESS_PORT}`);
  });
}
bootstrap();
