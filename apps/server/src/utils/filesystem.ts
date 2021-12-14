import fs from "fs";
import fse from "fs-extra";
import crypto from "crypto";

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

export const sha256 = (path: string) => {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const rs = fs.createReadStream(path);
    rs.on("error", (err) => reject(err));
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
  });
};
