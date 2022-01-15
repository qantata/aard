import { Injectable } from "@nestjs/common";
import { GqlOptionsFactory, GqlModuleOptions } from "@nestjs/graphql";
import { PrismaClient } from ".prisma/client";
import { makeSchema } from "nexus";
import * as path from "path";

import * as types from "@/nexus/graphql";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { UtilsService } from "@/utils/utils.service";
import { FFmpegService } from "@/ffmpeg/ffmpeg.service";
import { VideoStreamSessionManagerService } from "@/video-stream-session-manager/video-stream-session-manager.service";
import { Env } from "@/config/env";
import { Context } from "@/nexus/context";
import { FilesystemService } from "@/filesystem/filesystem.service";

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<Env>,
    private utils: UtilsService,
    private ffmpeg: FFmpegService,
    private filesystem: FilesystemService,
    private videoStreamSessionManager: VideoStreamSessionManagerService
  ) {}

  async createGqlOptions(): Promise<GqlModuleOptions> {
    // We should (probably?) migrate before passing prisma to Apollo server
    // Not sure if this is the best place to do this
    await this.prisma.migrate();

    const sourceTypesPath = path.join(
      this.config.get("IS_PKG", { infer: true }) ? this.config.get("PKG_SERVER_DIR", { infer: true }) : process.cwd(),
      "node_modules",
      ".prisma",
      "client",
      "index.d.ts"
    );

    const context = (): Context => {
      return {
        prisma: this.prisma,
        utils: this.utils,
        ffmpeg: this.ffmpeg,
        filesystem: this.filesystem,
        videoStreamSessionManager: this.videoStreamSessionManager,
      };
    };

    const schema = makeSchema({
      types,
      outputs: {
        schema: path.join(process.cwd(), "schema.graphql"),
        typegen: path.join(process.cwd(), "src", "nexus", "nexus.d.ts"),
      },
      sourceTypes: {
        modules: [{ module: sourceTypesPath, alias: "prisma" }],
        debug: process.env.NODE_ENV === "development",
      },
      contextType: {
        module: path.join(process.cwd(), "src", "nexus", "context.d.ts"),
        export: "Context",
      },
      nonNullDefaults: {
        input: true,
        output: false,
      },
      features: {
        abstractTypeStrategies: {
          resolveType: false,
          isTypeOf: true,
        },
      },
    });

    return {
      debug: true,
      playground: true,
      schema,
      context,
    };
  }
}
