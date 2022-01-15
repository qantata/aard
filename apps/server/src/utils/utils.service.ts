import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Env } from "@/config/env";
import * as path from "path";

@Injectable()
export class UtilsService {
  constructor(private config: ConfigService<Env>) {}

  getSessionStreamPath(sessionId: string, streamId?: string, filename?: string) {
    let dir = path.join(
      this.config.get("DATA_DIR", {
        infer: true,
      }),
      "sessions",
      String(sessionId)
    );

    if (streamId) {
      dir = path.join(dir, "streams", String(streamId));
    }

    if (filename) {
      dir = path.join(dir, filename);
    }

    return dir;
  }
}
