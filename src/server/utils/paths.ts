import path from "path";

import { DATA_DIR } from "./constants";

export const getSessionStreamPath = (sessionId: string, streamId: string, filename?: string) => {
  const dir = path.join(DATA_DIR, "sessions", String(sessionId), "streams", String(streamId));

  if (filename) {
    return path.join(dir, filename);
  }

  return dir;
};
