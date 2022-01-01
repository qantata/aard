import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as crypto from "crypto";

@Injectable()
export class FilesystemService {
  async isDirectory(path: string) {
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
  }

  sha256(path: string) {
    return new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const rs = fs.createReadStream(path);
      rs.on("error", (err) => reject(err));
      rs.on("data", (chunk) => hash.update(chunk));
      rs.on("end", () => resolve(hash.digest("hex")));
    });
  }
}
