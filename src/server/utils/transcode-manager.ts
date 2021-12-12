import fse from "fs-extra";

import { VideoProbeResultType } from "./ffprobe-transformer";
import { getSessionStreamPath } from "./paths";
import { Transcoder } from "./transcoder";

type Transcodes = {
  [sessionId: string]: {
    transcoder: Transcoder;
  };
};

const transcodes: Transcodes = {};

export const handleStreamSegmentRequest = async (
  filepath: string,
  sessionId: string,
  profileId: string,
  segment: string,
  probeData: VideoProbeResultType,
  width: number,
  videoBitrate?: number,
  audioBitrate?: number,
  isPreloadRequest: boolean = false
) => {
  const stream = transcodes[sessionId];
  if (!stream) {
    transcodes[sessionId] = {
      transcoder: new Transcoder(filepath, probeData),
    };
  }

  const segmentNr = parseInt(segment);
  const transcoder = transcodes[sessionId].transcoder;
  const streamPath = getSessionStreamPath(sessionId, profileId);
  const segmentExists = await transcodes[sessionId].transcoder.requestSegment(
    segmentNr,
    isPreloadRequest,
    streamPath,
    width,
    videoBitrate,
    audioBitrate
  );

  if (segmentExists) {
    return;
  }

  // This relies on the client not requesting multiple different segments in parallel.
  // The current web client doesn't do this at least but when new clients are added, this needs to be
  // changed if they do request segments in parallel
  return new Promise<void>((resolve) => {
    transcoder.onSegmentTranscoded((segment) => {
      if (segment === segmentNr) resolve();
    });
  });
};

export const handleSessionDeletion = async (sessionId: string) => {
  transcodes[sessionId]?.transcoder.destroy();
  delete transcodes[sessionId];

  try {
    await fse.remove(getSessionStreamPath(sessionId));
  } catch (err) {
    console.error(err);
  }
};
