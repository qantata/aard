import { getSessionStreamPath } from "./paths";
import { Transcoder } from "./transcoder";

type Transcodes = {
  [sessionId: string]: {
    [streamId: string]: {
      latestSegment: number;
      transcoder: Transcoder;
    };
  };
};

const transcodes: Transcodes = {};

export const handleStreamSegmentRequest = async (
  filepath: string,
  sessionId: string,
  streamId: string,
  segment: string
) => {
  const streamPath = getSessionStreamPath(sessionId, streamId);

  const stream = transcodes[sessionId]?.[streamId];
  if (!stream) {
    if (!transcodes[sessionId]) {
      transcodes[sessionId] = {};
    }

    transcodes[sessionId][streamId] = {
      latestSegment: 0,
      transcoder: new Transcoder(filepath, streamPath),
    };
  }
};

export const handleSessionDeletion = async (sessionId: string) => {
  const session = transcodes[sessionId];

  if (session) {
    for (const key in session) {
      session[key].transcoder.stop();
    }
  }

  delete transcodes[sessionId];
};
