import klaw from "klaw";
import path from "path";
import through2 from "through2";
import fs from "fs";
import fse from "fs-extra";
import { filenameParse } from "@ctrl/video-filename-parser";

import { context } from "./context";

const isDirectory = async (path: string) => {
  return new Promise((resolve) => {
    fs.lstat(path, (err, stats) => {
      if (err) {
        console.error(err);
        resolve(false);
        return;
      }

      resolve(stats.isDirectory());
    });
  });
};

// TODO: Handle errors better
export const scanNewLibrary = async (id: string, root: string) => {
  console.log(`Scanning library with id ${id} and root ${root}`);

  const exists = await fse.pathExists(root);
  if (!exists) {
    console.error(`Path doesn't exist: ${root}`);
    return;
  }

  const isDir = await isDirectory(root);
  if (!isDir) {
    console.error(`Path isn't a directory: ${root}`);
    return;
  }

  const videoFileFilter = through2.obj(function (item, _enc, next) {
    // Temporarily only accept mp4 files until transcoding is added
    if (item.path.endsWith(".mp4")) this.push(item);
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

  const items: string[] = [];
  klaw(root, {
    preserveSymlinks: false,
    filter,
  })
    .pipe(videoFileFilter)
    .on("data", (item) => items.push(item.path))
    .on("error", (err: Error, _item: any) => console.error(err))
    .on("end", () => createNewMovies(items, id));
};

const createNewMovies = async (items: string[], libraryId: string) => {
  for (const item of items) {
    const data = filenameParse(path.basename(item, ".mp4"));

    await context().prisma.movie.create({
      data: {
        id: String(Math.random() * 100000),
        title: data.title,
        year: data.year ? parseInt(data.year) : null,
        filepath: item,
        library: {
          connect: {
            id: libraryId,
          },
        },
      },
    });
  }
};
