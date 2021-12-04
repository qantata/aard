import { VideoProbeResultType } from "./ffprobe-transformer";
import { getSessionStreamPath } from "./paths";
import { Transcoder } from "./transcoder";

type Transcodes = {
  [sessionId: string]: {
    [streamId: string]: {
      transcoder: Transcoder;
    };
  };
};

const transcodes: Transcodes = {};

export const handleStreamSegmentRequest = async (
  filepath: string,
  sessionId: string,
  streamId: string,
  segment: string,
  probeData: VideoProbeResultType
) => {
  const streamPath = getSessionStreamPath(sessionId, streamId);

  const stream = transcodes[sessionId]?.[streamId];
  if (!stream) {
    if (!transcodes[sessionId]) {
      transcodes[sessionId] = {};
    }

    transcodes[sessionId][streamId] = {
      transcoder: new Transcoder(filepath, streamPath, probeData),
    };
  }

  const segmentNr = parseInt(segment);
  const transcoder = transcodes[sessionId][streamId].transcoder;
  const segmentExists = transcodes[sessionId][streamId].transcoder.requestSegment(segmentNr);

  if (segmentExists) {
    return;
  }

  // This relies on the client not requesting multiple different segments in parallel.
  // Hls.js doesn't do this at least but when new clients are added, this needs to be
  // changed if they do request segments in parallel
  const promise = new Promise<void>((resolve, _reject) => {
    transcoder.onSegmentTranscoded((segment) => {
      if (segment === segmentNr) resolve();
    });
  });

  return promise;
};

export const handleSessionDeletion = async (sessionId: string) => {
  const session = transcodes[sessionId];

  if (session) {
    for (const key in session) {
      session[key].transcoder.destroy();
    }
  }

  delete transcodes[sessionId];
};
