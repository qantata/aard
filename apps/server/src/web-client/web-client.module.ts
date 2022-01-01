import { IS_PKG } from "@/utils/constants";
import { DynamicModule, Module } from "@nestjs/common";
import { createServer } from "vite";

import { WebClientService } from "./web-client.service";

const webClientFactory = {
  provide: "VITE",
  useFactory: async () => {
    const vite = await createServer({
      root: IS_PKG ? undefined : "../web",
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
  providers: [webClientFactory, WebClientService],
  exports: [WebClientService],
})
export class WebClientModule {}
