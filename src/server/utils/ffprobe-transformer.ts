import { FFProbeOutputType } from "./ffmpeg";
import { getDecoders } from "./ffmpeg-support";

const formatMap: { [key: string]: string } = {
  // TODO: Correct?
  "mov,mp4,m4a,3gp,3g2,mj2": "mp4",
  matroska: "mkv",
  mpegts: "ts",
  // TODO: Correct?
  "matroska,webm": "webm",
};

export type VideoProbeResultType = {
  container: string;
  containerDuration?: number;
  videoStreams: {
    codec: string;
    profile?: string;
    width?: number;
    height?: number;
    level?: number;
    duration?: number;
    bitsPerSample?: number;
  }[];
  audioStreams: {
    codec: string;
    profile?: string;
    channels?: number;
    duration?: number;
  }[];
  // TODO: Add subtitles
};

/*
 * Transforms the output from the ffprobe command into a format that's more usable in the app.
 * Also throws errors if needed information is missing or if it contains codecs or a container
 * that is not supported by ffmpeg
 */
export const transformAndValidateFfprobeOutput = async (output: FFProbeOutputType) => {
  if (!output.format?.format_name) {
    throw new Error("Format not defined");
  }

  // Container
  let container = output.format.format_name;
  const formatKeys = Object.keys(formatMap);
  if (formatKeys.includes(output.format.format_name)) {
    container = formatMap[container];
  }

  if (!output.streams?.length) {
    throw new Error("File has no streams");
  }

  const decoders = await getDecoders();
  if (!decoders) {
    // TODO: If ffmpeg isn't available for some reason, direct play should be still supported
    throw new Error("There are no available decoders");
  }

  // Get streams
  const videoStreams = output.streams.filter((s) => {
    return s.codec_type === "video" && s.codec_name && decoders.video[s.codec_name];
  });
  if (!videoStreams.length) {
    throw new Error("File has no supported video streams");
  }

  const audioStreams = output.streams.filter((s) => {
    return s.codec_type === "audio" && s.codec_name && decoders.audio[s.codec_name];
  });
  const subtitleStreams = output.streams.filter((s) => {
    return s.codec_type === "subtitle" && s.codec_name && decoders.subtitle[s.codec_name];
  });

  const result: VideoProbeResultType = {
    container,
    containerDuration: output.format.duration ? parseFloat(output.format.duration) : undefined,
    videoStreams: videoStreams.map((s) => ({
      codec: s.codec_name!,
      profile: s.profile,
      width: s.width,
      height: s.height,
      level: s.level,
      duration: s.duration ? parseFloat(s.duration) : undefined,
      bitsPerSample: s.bits_per_raw_sample ? parseInt(s.bits_per_raw_sample) : undefined,
    })),
    audioStreams: audioStreams.map((s) => ({
      codec: s.codec_name!,
      profile: s.profile,
      channels: s.channels,
      duration: s.duration ? parseFloat(s.duration) : undefined,
    })),
    // TODO: Add subtitles
  };

  return result;
};
