import { Injectable } from "@nestjs/common";
import * as path from "path";

import { DATABASE_URL } from "./constants";

@Injectable()
export class UtilsService {
  getSessionStreamPath(sessionId: string, streamId?: string, filename?: string) {
    let dir = path.join(DATABASE_URL, "sessions", String(sessionId));

    if (streamId) {
      dir = path.join(dir, "streams", String(streamId));
    }

    if (filename) {
      dir = path.join(dir, filename);
    }

    return dir;
  }
}
