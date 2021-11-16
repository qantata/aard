import fs from "fs";
import fse from "fs-extra";

export const isDirectory = async (path: string) => {
  return new Promise(async (resolve) => {
    const exists = await fse.pathExists(path);
    if (!exists) {
      resolve(false);
      return;
    }

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
