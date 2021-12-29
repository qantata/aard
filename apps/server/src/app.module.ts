import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { RouterModule } from "@nestjs/core";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphqlConfigModule } from "./graphql-config/graphql-config.module";
import { GraphqlConfigService } from "./graphql-config/graphql-config.service";
import { WebClientModule } from "./web-client/web-client.module";
import { MoviesModule } from "./movies/movies.module";
import { VideoStreamSessionModule } from "./video-stream-session/video-stream-session.module";
import { VideoStreamSessionManagerModule } from "./video-stream-session-manager/video-stream-session-manager.module";

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
      imports: [GraphqlConfigModule],
    }),
    RouterModule.register([
      {
        path: "api",
        children: [
          {
            path: "movies",
            module: MoviesModule,
          },
          {
            path: "sessions",
            module: VideoStreamSessionModule,
          },
        ],
      },
    ]),
    WebClientModule,
    MoviesModule,
    VideoStreamSessionModule,
    VideoStreamSessionManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
