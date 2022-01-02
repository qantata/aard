import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as path from "path";
import * as fs from "fs";

import { FFmpegService } from "./ffmpeg.service";
import { Env } from "@/config/env";
import { FilesystemService } from "@/filesystem/filesystem.service";
import { FilesystemModule } from "@/filesystem/filesystem.module";

const ffmpegFactory = {
  provide: "FFMPEG_CACHE",
  inject: [FFmpegService, ConfigService, FilesystemService],
  useFactory: async (ffmpeg: FFmpegService, config: ConfigService<Env>, filesystem: FilesystemService) => {
    return new Promise<void>(async (resolve) => {
      // TODO: Don't hardcode path
      const cachePath = path.join(config.get("DATA_DIR"), "ffmpeg-cache.json");
      const ffmpegHash: string = await filesystem.sha256("/usr/bin/ffmpeg");

      let shouldUpdate = false;

      if (!fs.existsSync(cachePath)) {
        console.log("The ffmpeg cache doesn't exist and will be created");
        shouldUpdate = true;
      } else {
        var cacheData = JSON.parse(
          fs.readFileSync(cachePath, {
            encoding: "utf8",
          })
        );

        try {
          const oldHash = cacheData.ffmpegHash;

          if (!oldHash || ffmpegHash !== oldHash) {
            console.log("The ffmpeg binary has changed - cache will be updated");
            console.log("Old hash:", oldHash);
            console.log("New hash:", ffmpegHash);
            shouldUpdate = true;
          }
        } catch (err) {
          console.error("Couldn't hash ffmpeg binary - forcing ffmpeg cache update");
          shouldUpdate = true;
        }
      }

      // Check if data is missing from the cache file
      if (
        !shouldUpdate &&
        (!cacheData.decoders ||
          !cacheData.encoders ||
          !cacheData.demuxers ||
          !cacheData.muxers ||
          !cacheData.extensions)
      ) {
        console.log("The ffmpeg cache is missing data and will be udpated");
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        console.log("Updating ffmpeg cache, this will take a moment...");

        // Update to cache is needed, fetch values from ffmpeg and write them to the cache
        const decoders = await ffmpeg.getDecoders();
        const encoders = await ffmpeg.getEncoders();
        const demuxers = await ffmpeg.getDemuxers();
        const muxers = await ffmpeg.getMuxers();
        const extensions = await ffmpeg.getDemuxerFileExtensions();

        const data = {
          ffmpegHash,
          decoders,
          encoders,
          demuxers,
          muxers,
          extensions,
        };

        fs.writeFile(cachePath, JSON.stringify(data, null, 2), { encoding: "utf8" }, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Done updating ffmpeg cache.");
          }

          resolve();
        });
      } else {
        // Set values so that they don't need to be fetched from ffmpeg - the entire point of the cache!
        ffmpeg.setSupportValues(
          cacheData.decoders,
          cacheData.encoders,
          cacheData.demuxers,
          cacheData.muxers,
          cacheData.extensions
        );

        resolve();
      }
    });
  },
};

@Module({
  imports: [ConfigModule, FilesystemModule],
  providers: [ffmpegFactory, FFmpegService],
  exports: [FFmpegService],
})
export class FFmpegModule {}
