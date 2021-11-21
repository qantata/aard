import { ffmpeg } from "./ffmpeg";

type Coders = {
  video: {
    [key: string]: boolean;
  };
  audio: {
    [key: string]: boolean;
  };
  subtitle: {
    [key: string]: boolean;
  };
};

type Muxers = {
  [key: string]: boolean;
};

let cachedDecoders: Coders | null = null;
let cachedEncoders: Coders | null = null;
let cachedDemuxers: Muxers | null = null;
let cachedMuxers: Muxers | null = null;
let cachedDemuxerFileExtensions: string[] | null = null;

const getCodersFromFfmpegOutput = (output: string[]) => {
  const coders: Coders = {
    video: {},
    audio: {},
    subtitle: {},
  };

  for (const coder of output) {
    const cols = coder.split(" ");

    if (cols.length < 3) {
      throw new Error("ffmpeg encoder/decoder output was unexpected; unsupported version?");
    }

    const flags = cols[1];
    const codec = cols[2];

    switch (flags[0]) {
      case "V":
        coders.video[codec] = true;
        break;
      case "A":
        coders.audio[codec] = true;
        break;
      case "S":
        coders.subtitle[codec] = true;
        break;
      default:
        console.warn("encountered unknown ffmpeg type:", flags[0]);
    }
  }

  return coders;
};

const getMuxersFromFfmpegOutput = (output: string[]) => {
  const muxers: Muxers = {};

  for (const muxer of output) {
    const cols = muxer.split(" ");

    if (cols.length < 4) {
      throw new Error("ffmpeg muxer/demuxer output was unexpected; unsupported version?");
    }

    muxers[cols[3]] = true;
  }

  return muxers;
};

const getRelevantLinesFromFfmpegOutput = (output: string) => {
  const dividerIndex = output.indexOf("-\n");

  if (dividerIndex === -1) {
    throw new Error("ffmpeg output was unexpected; unsupported version?");
  }

  let result = output.slice(dividerIndex, output.length).split("\n");
  // First row is the divider, last row is an empty row. Other rows are actual data
  if (result.length <= 2) {
    return null;
  }

  return (result = result.slice(1, result.length - 1));
};

export const getDecoders = async (): Promise<Coders | null> => {
  if (cachedDecoders !== null) {
    return cachedDecoders;
  }

  try {
    const result = await ffmpeg(["-decoders"]);

    const decoders = getRelevantLinesFromFfmpegOutput(result);
    if (!decoders) {
      return null;
    }

    cachedDecoders = getCodersFromFfmpegOutput(decoders);
    return cachedDecoders;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getEncoders = async (): Promise<Coders | null> => {
  if (cachedEncoders !== null) {
    return cachedEncoders;
  }

  try {
    const result = await ffmpeg(["-encoders"]);

    const encoders = getRelevantLinesFromFfmpegOutput(result);
    if (!encoders) {
      return null;
    }

    cachedEncoders = getCodersFromFfmpegOutput(encoders);
    return cachedEncoders;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getDemuxers = async (): Promise<Muxers | null> => {
  if (cachedDemuxers !== null) {
    return cachedDemuxers;
  }

  try {
    const result = await ffmpeg(["-demuxers"]);

    const demuxers = getRelevantLinesFromFfmpegOutput(result);
    if (!demuxers) {
      return null;
    }

    cachedDemuxers = getMuxersFromFfmpegOutput(demuxers);
    return cachedDemuxers;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getMuxers = async (): Promise<Muxers | null> => {
  if (cachedMuxers !== null) {
    return cachedMuxers;
  }

  try {
    const result = await ffmpeg(["-muxers"]);

    const muxers = getRelevantLinesFromFfmpegOutput(result);
    if (!muxers) {
      return null;
    }

    cachedMuxers = getMuxersFromFfmpegOutput(muxers);
    return cachedMuxers;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getDemuxerFileExtensions = async (): Promise<string[] | null> => {
  if (cachedDemuxerFileExtensions !== null) {
    return cachedDemuxerFileExtensions;
  }

  try {
    const demuxers = await getDemuxers();
    if (!demuxers) {
      return null;
    }

    let extensions: string[] = [];
    for (let [demuxer, _] of Object.entries(demuxers)) {
      try {
        const result = await ffmpeg(["-h", `demuxer=${demuxer}`]);
        const commonExtensionsStr = "Common extensions: ";
        const commonExtensionsStrIndex = result.indexOf(commonExtensionsStr);

        if (commonExtensionsStrIndex === -1) {
          continue;
        }

        // Find start and end index for extension list
        const startIdx = commonExtensionsStrIndex + commonExtensionsStr.length;
        let endIdx = startIdx;
        for (let idx = startIdx; idx < result.length; idx++) {
          if (result[idx] === ".") {
            endIdx = idx;
            break;
          }
        }

        extensions = [...extensions, ...result.substring(startIdx, endIdx).split(",")];
      } catch (err) {
        console.error(err);
      }
    }

    return extensions;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const setFfmpegSupportValues = (
  decoders: Coders,
  encoders: Coders,
  demuxers: Muxers,
  muxers: Muxers,
  extensions: string[]
) => {
  cachedDecoders = decoders;
  cachedEncoders = encoders;
  cachedDemuxers = demuxers;
  cachedMuxers = muxers;
  cachedDemuxerFileExtensions = extensions;
};
