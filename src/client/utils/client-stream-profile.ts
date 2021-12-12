import { browser, Browser } from "./browser";

type Containers = {
  mp4?: boolean;
  mkv?: boolean;
  webm?: boolean;
  ts?: boolean;
};

type VideoCodecs = {
  h264?: {
    level: number;
    profile: "baseline" | "extended" | "main" | "high" | "high10";
  };
};

type AudioCodecs = {
  flac?: boolean;
  aac?: boolean;
  ac3?: boolean;
  mp3?: boolean;
};

type ClientStreamProfile = {
  containers: Containers;
  videoCodecs: VideoCodecs;
  audioCodecs: AudioCodecs;
};

const canPlayType = (e: HTMLVideoElement | HTMLAudioElement, type: string) => {
  return e.canPlayType(type) !== "";
};

const getMp4Compatibility = (v: HTMLVideoElement) => {
  if (browser == Browser.firefox || browser == Browser.chromium) {
    return true;
  } else {
    return canPlayType(v, "video/mp4");
  }
};

const getMkvCompatibility = (v: HTMLVideoElement) => {
  return canPlayType(v, "video/mkv") || canPlayType(v, "video/x-matroska");
};

const getWebmCompatibility = (v: HTMLVideoElement) => {
  if (browser == Browser.firefox || browser == Browser.chromium) {
    return true;
  } else {
    return canPlayType(v, "video/webm");
  }
};

const getTsCompatibility = (v: HTMLVideoElement) => {
  if (window.MediaSource) {
    return true;
  } else if (canPlayType(v, "application/x-mpegURL") || canPlayType(v, "application/vnd.apple.mpegURL")) {
    return true;
  }

  return false;
};

const getH264Compatibility = (v: HTMLVideoElement): VideoCodecs["h264"] => {
  // Baseline level 40 (first level for 1080p video)
  // TODO: Maybe we want to check for lower level?
  // Right now this assumes that being able to play back <1080p video is useless
  if (canPlayType(v, 'video/mp4; codecs="avc1.420028"')) {
    const result: VideoCodecs["h264"] = {
      level: 40,
      profile: "baseline",
    };

    // Baseline level 51 (first level for 4k video)
    // TODO: Do we care about level 52?
    let levelHex = "28";
    if (canPlayType(v, 'video/mp4; codecs="avc1.420033"')) {
      levelHex = "33";
      result.level = 51;
    }

    // High 10 profile (10bit)
    if (canPlayType(v, `video/mp4; codecs="avc1.6e00${levelHex}"`)) {
      result.profile = "high10";
    }
    // High profile (8bit)
    else if (canPlayType(v, `video/mp4; codecs="avc1.6400${levelHex}"`)) {
      result.profile = "high";
    }

    return result;
  }

  return undefined;
};

const getCompatibleContainers = (v: HTMLVideoElement): Containers => {
  const c: Containers = {};

  c.mp4 = getMp4Compatibility(v);
  c.mkv = getMkvCompatibility(v);
  c.webm = getWebmCompatibility(v);
  c.ts = getTsCompatibility(v);

  return c;
};

const getCompatibleVideoCodecs = (v: HTMLVideoElement): VideoCodecs => {
  const c: VideoCodecs = {};

  c.h264 = getH264Compatibility(v);

  return c;
};

const getCompatibleAudioCodecs = (): AudioCodecs => {
  const c: AudioCodecs = {};

  const a = document.createElement("audio");
  c.flac = canPlayType(a, "audio/flac");
  c.aac = canPlayType(a, "audio/aac");
  c.ac3 = canPlayType(a, "audio/ac3");
  c.mp3 = canPlayType(a, "audio/mp3");

  return c;
};

export const getClientStreamProfile = () => {
  const v = document.createElement("video");

  const profile: ClientStreamProfile = {
    containers: getCompatibleContainers(v),
    videoCodecs: getCompatibleVideoCodecs(v),
    audioCodecs: getCompatibleAudioCodecs(),
  };

  return profile;
};
