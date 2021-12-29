import * as fs from "fs";
import * as path from "path";

import { DATA_DIR } from "./constants";
import { sha256 } from "./filesystem";
import {
  getDecoders,
  getDemuxers,
  getEncoders,
  getMuxers,
  getDemuxerFileExtensions,
  setFfmpegSupportValues,
} from "./ffmpeg-support";

// TODO: Maybe we should store this in the database, since it would allow typings?
// Another TODO: make this asynchronous, so that the user doesn't need to wait several seconds
// for the app to start if the cache is out of date
export const updateFfmpegCache = async () => {
  return new Promise<void>(async (resolve) => {
    const cachePath = path.join(DATA_DIR, "ffmpeg-cache.json");
    let shouldUpdate = false;
    const ffmpegHash: string = await sha256("/usr/bin/ffmpeg");

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
        // TODO: Don't hardcode path
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
      (!cacheData.decoders || !cacheData.encoders || !cacheData.demuxers || !cacheData.muxers || !cacheData.extensions)
    ) {
      console.log("The ffmpeg cache is missing data and will be udpated");
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      console.log("Updating ffmpeg cache, this will take a moment...");

      // Update to cache is needed, fetch values from ffmpeg and write them to the cache
      const decoders = await getDecoders();
      const encoders = await getEncoders();
      const demuxers = await getDemuxers();
      const muxers = await getMuxers();
      const extensions = await getDemuxerFileExtensions();

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
      setFfmpegSupportValues(
        cacheData.decoders,
        cacheData.encoders,
        cacheData.demuxers,
        cacheData.muxers,
        cacheData.extensions
      );

      resolve();
    }
  });
};
