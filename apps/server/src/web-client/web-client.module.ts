import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createServer } from "vite";

import { WebClientService } from "./web-client.service";
import { Env } from "@/config/env";

const webClientFactory = {
  provide: "VITE",
  inject: [ConfigService],
  useFactory: async (config: ConfigService<Env>) => {
    const vite = await createServer({
      root: config.get("IS_PKG", {
        infer: true,
      })
        ? undefined
        : "../web",
      server: {
        // Need proxy so we can have a reachable API (Vite uses all the routes)
        proxy: {
          "/api": {
            target: "http://localhost:5004",
            changeOrigin: true,
            secure: true,
          },
        },
      },
    });

    await vite.listen(5005);

    // Because otherwise the log statement would be buried inside Nest startup logs
    console.log("> Web client vXXX ready at http://localhost:5005");

    return vite;
  },
};

@Module({
  imports: [ConfigModule],
  providers: [webClientFactory, WebClientService],
  exports: [WebClientService],
})
export class WebClientModule {}
