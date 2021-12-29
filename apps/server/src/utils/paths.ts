import * as path from "path";

import { DATA_DIR } from "./constants";

export const getSessionStreamPath = (sessionId: string, streamId?: string, filename?: string) => {
  let dir = path.join(DATA_DIR, "sessions", String(sessionId));

  if (streamId) {
    dir = path.join(dir, "streams", String(streamId));
  }

  if (filename) {
    dir = path.join(dir, filename);
  }

  return dir;
};
