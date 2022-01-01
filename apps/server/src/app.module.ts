import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { RouterModule } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import env from "./config/env";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphqlConfigModule } from "./graphql-config/graphql-config.module";
import { GraphqlConfigService } from "./graphql-config/graphql-config.service";
import { WebClientModule } from "./web-client/web-client.module";
import { MoviesModule } from "./movies/movies.module";
import { VideoStreamSessionModule } from "./video-stream-session/video-stream-session.module";
import { VideoStreamSessionManagerModule } from "./video-stream-session-manager/video-stream-session-manager.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [env],
    }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
      imports: [GraphqlConfigModule, PrismaModule],
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
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
