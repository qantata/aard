import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { filenameParse } from "@ctrl/video-filename-parser";
import * as through2 from "through2";
import Bottleneck from "bottleneck";
import * as klaw from "klaw";
import * as path from "path";
import * as fs from "fs";

import { FFmpegService, FFProbeOutputType, VideoProbeResultType } from "@/ffmpeg/ffmpeg.service";
import { FilesystemService } from "@/filesystem/filesystem.service";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class LibraryService {
  private movieCreatorLimiter: Bottleneck;

  constructor(
    private filesystem: FilesystemService,
    private ffmpeg: FFmpegService,
    @Inject(forwardRef(() => PrismaService)) private prisma: PrismaService
  ) {
    this.movieCreatorLimiter = new Bottleneck();

    // For some reason this is needed, passing in the options
    // via the constructor doesn't work.
    this.movieCreatorLimiter.updateSettings({
      maxConcurrent: 1,
    });
  }

  async scan(id: string, root: string) {
    console.log(`Scanning library with id ${id} and root ${root}`);

    const isDir = await this.filesystem.isDirectory(root);
    if (!isDir) {
      console.error(`Path isn't a directory: ${root}`);
      return;
    }

    const demuxerExtensions = await this.ffmpeg.getDemuxerFileExtensions();
    const videoFileFilter = through2.obj(function (item, _enc, next) {
      // Some extensions that aren't in the ffmpeg list for some reason
      const extraExtensions = ["mp4", "mov", "ts", "m2ts"];
      const ffmpegExtensions = demuxerExtensions ? demuxerExtensions : [];
      const extensions = [...ffmpegExtensions, ...extraExtensions];

      for (const ext of extensions) {
        if (item.path.endsWith(`.${ext}`)) {
          this.push(item);
          break;
        }
      }

      next();
    });

    // Filter out hidden directories & non-existant files (can happen with symlinks and it leads to errors with klaw)
    const filter = (item: string) => {
      const basename = path.basename(item);
      if (basename !== "." && basename[0] === ".") {
        return false;
      }

      return fs.existsSync(item);
    };

    klaw(root, {
      preserveSymlinks: false,
      filter,
    })
      .pipe(videoFileFilter)
      .on("data", async (item) => {
        try {
          console.log("Found video file:", item.path);
          const rawProbeData = await this.ffmpeg.probeFileData(item.path);

          // For streams that don't have the bit_rate value, we need to probe it manually
          for (const [index, stream] of rawProbeData.streams.entries()) {
            if ((stream.codec_type === "video" || stream.codec_type === "audio") && !stream.bit_rate) {
              //const bitRate = await probeFileVideoBitrate(item.path, index, rawProbeData.format?.duration);
              //rawProbeData.streams[index].bit_rate = `${bitRate}`;
              // TODO: Maybe we shouldnt do this, it takes a long time for long video files
            }
          }

          const probeData = await this.ffmpeg.transformAndValidateFfprobeOutput(rawProbeData);
          this.movieCreatorLimiter.schedule(() => this.createScannedMovie(id, item.path, rawProbeData, probeData));
        } catch (err) {
          // File isn't compatible with ffmpeg or something else went wrong
          console.error(item.path, err);
        }
      })
      .on("error", (err: Error, item: any) => {
        console.error(err);
        console.error("This error occured with the following item:", item);
      })
      .on("end", () => {
        console.log(`Finished scanning library ${root}\n`);
      });
  }

  private async createScannedMovie(
    libraryId: string,
    filepath: string,
    rawProbeData: FFProbeOutputType,
    probeData: VideoProbeResultType
  ) {
    const parseData = filenameParse(path.basename(filepath, path.extname(filepath)));

    // TODO: Add proper implementation for this
    // The library doesn't parse filenames correctly if they dont have a year
    // and the words are separated by dots
    let title = parseData.title;
    const splitByDot = parseData.title.split(".");
    if (splitByDot.filter((s) => s.length > 0).length > 1) {
      title = splitByDot.join(" ");
    }

    try {
      await this.prisma.movie.create({
        data: {
          id: String(Math.random() * 100000),
          title,
          year: parseData.year ? parseInt(parseData.year) : null,
          library: {
            connect: {
              id: libraryId,
            },
          },
          files: {
            create: {
              id: `video-file${Math.random() * 100000}`,
              path: filepath,
              rawProbeData: JSON.stringify(rawProbeData),
              probeData: JSON.stringify(probeData),
            },
          },
        },
      });
    } catch (err) {
      console.error("Couldn't create movie for file", filepath);
      console.error(err);
    }
  }
}
