import klaw from "klaw";
import path from "path";
import through2 from "through2";
import fs from "fs";
import { filenameParse } from "@ctrl/video-filename-parser";

import { context } from "./context";
import { isDirectory } from "./utils/filesystem";
import { ffprobe, FFProbeOutputType, probeFileData, probeFileVideoBitrate } from "./utils/ffmpeg";
import { getDemuxerFileExtensions } from "./utils/ffmpeg-support";
import { transformAndValidateFfprobeOutput, VideoProbeResultType } from "./utils/ffprobe-transformer";

// TODO: Handle errors better
export const scanNewLibrary = async (id: string, root: string) => {
  console.log(`Scanning library with id ${id} and root ${root}`);

  const isDir = await isDirectory(root);
  if (!isDir) {
    console.error(`Path isn't a directory: ${root}`);
    return;
  }

  const demuxerExtensions = await getDemuxerFileExtensions();
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
        const rawProbeData = await probeFileData(item.path);

        // For streams that don't have the bit_rate value, we need to probe it manually
        for (const [index, stream] of rawProbeData.streams.entries()) {
          if ((stream.codec_type === "video" || stream.codec_type === "audio") && !stream.bit_rate) {
            const bitRate = await probeFileVideoBitrate(item.path, index, rawProbeData.format?.duration);
            rawProbeData.streams[index].bit_rate = `${bitRate}`;
          }
        }

        const probeData = await transformAndValidateFfprobeOutput(rawProbeData);

        createScannedMovie(id, item.path, rawProbeData, probeData);
      } catch (err) {
        // File isn't compatible with ffmpeg or something else went wrong
        console.error(err);
      }
    })
    .on("error", (err: Error, item: any) => {
      console.error(err);
      console.error("This error occured with the following item:", item);
    })
    .on("end", () => {
      console.log(`Finished scanning library ${root}\n`);
    });
};

const createScannedMovie = async (
  libraryId: string,
  filepath: string,
  rawProbeData: FFProbeOutputType,
  probeData: VideoProbeResultType
) => {
  const parseData = filenameParse(path.basename(filepath, path.extname(filepath)));

  await context().prisma.movie.create({
    data: {
      id: String(Math.random() * 100000),
      title: parseData.title,
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
          // TODO: Let's not do this :)
          rawProbeData: JSON.stringify(rawProbeData),
          probeData: JSON.stringify(probeData),
        },
      },
    },
  });
};
