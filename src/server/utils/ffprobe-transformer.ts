import { FFProbeOutputType } from "./ffmpeg";
import { getDecoders } from "./ffmpeg-support";

const formatMap: { [key: string]: string } = {
  // TODO: Correct?
  "mov,mp4,m4a,3gp,3g2,mj2": "mp4",
  matroska: "mkv",
  mpegts: "ts",
  // ffmpeg uses "matroska,webm" for both webm and matroska files, but
  // most of the time the actual container is matroska
  "matroska,webm": "mkv",
};

export type VideoProbeResultType = {
  container: string;
  containerDuration?: number;
  videoStreams: {
    codec: string;
    profile?: string;
    width: number;
    height: number;
    level?: number;
    duration?: number;
    bitsPerSample?: number;
    bitRate: number;
    fps?: number;
  }[];
  audioStreams: {
    codec: string;
    profile?: string;
    channels?: number;
    duration?: number;
    bitRate: number;
  }[];
  // TODO: Add subtitles
};

// Parses an ffprobe stream's frame rate into a number
// The frame rates are usually presented as "x/y", for example "24/1"
const parseFpsFromStream = (stream: FFProbeOutputType["streams"][number]) => {
  const fpsStr = stream.r_frame_rate || stream.avg_frame_rate;
  if (!fpsStr) {
    throw new Error("Stream has no FPS information");
  }

  const [nom, denom] = fpsStr.split("/");
  if (!nom || !denom) {
    throw new Error("Stream frame rate has unexpected format");
  }

  const nomNumber = parseInt(nom);
  const denomNumber = parseInt(denom);

  if (isNaN(nomNumber) || isNaN(denomNumber) || nomNumber <= 0 || denomNumber <= 0) {
    throw new Error("Stream frame rate values are invalid");
  }

  return nomNumber / denomNumber;
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

  const videoStreams: VideoProbeResultType["videoStreams"] = output.streams.flatMap((s) => {
    if (
      s.codec_type !== "video" ||
      !s.codec_name ||
      !s.width ||
      !s.height ||
      !s.bit_rate ||
      !decoders.video[s.codec_name]
    ) {
      return [];
    }

    let fps: number | undefined;
    try {
      fps = parseFpsFromStream(s);
    } catch (err) {
      console.error(err);
    }

    return {
      codec: s.codec_name!,
      profile: s.profile,
      width: s.width,
      height: s.height,
      level: s.level,
      bitRate: parseFloat(s.bit_rate),
      fps,
      duration: s.duration ? parseFloat(s.duration) : undefined,
      bitsPerSample: s.bits_per_raw_sample ? parseInt(s.bits_per_raw_sample) : undefined,
    };
  });

  if (!videoStreams.length) {
    throw new Error("No valid video streams for file");
  }

  const audioStreams: VideoProbeResultType["audioStreams"] = output.streams.flatMap((s) => {
    if (
      s.codec_type !== "audio" ||
      !s.codec_name ||
      !decoders.audio[s.codec_name] ||
      !s.bit_rate ||
      s.bit_rate === "0"
    ) {
      return [];
    }

    return {
      codec: s.codec_name!,
      profile: s.profile,
      channels: s.channels,
      bitRate: parseFloat(s.bit_rate),
      duration: s.duration ? parseFloat(s.duration) : undefined,
    };
  });

  const result: VideoProbeResultType = {
    container,
    containerDuration: output.format.duration ? parseFloat(output.format.duration) : undefined,
    videoStreams,
    audioStreams,
    // TODO: Add subtitles
  };

  return result;
};

export const parseProbeDataString = (data: string): VideoProbeResultType => {
  return JSON.parse(data);
};
