import { spawn } from "child_process";

const ffspawn = async (cmd: "ffmpeg" | "ffprobe", filepath: string | null, args: string[]) => {
  return new Promise<string>((resolve, reject) => {
    const processArgs = ["-hide_banner", "-loglevel", "fatal", ...args];
    if (filepath) {
      processArgs.push(filepath);
    }

    const process = spawn(cmd, processArgs);

    let stdoutData: any[] = [];

    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");

    process.stdout.on("data", (data) => {
      stdoutData.push(data);
    });
    process.stderr.on("data", (data) => {});

    process.on("exit", (code) => {});
    process.on("error", (err) => reject(err));
    process.on("close", () => {
      resolve(stdoutData.join(""));
    });
  });
};

// TODO: Fully type this
export type FFProbeOutputType = {
  streams: {
    codec_name?: string;
    profile?: string;
    codec_type?: string;
    width?: number;
    height?: number;
    level?: number;
    channels?: number;
    duration?: string;
    bits_per_raw_sample?: string;
    r_frame_rate?: string;
    avg_frame_rate?: string;
    bit_rate?: string;
  }[];
  format?: {
    format_name?: string;
    duration?: string;
  };
};

export const ffprobe = async (filepath: string, args?: string[]) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const result = await ffspawn("ffprobe", filepath, args || []);

      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

export const ffmpeg = async (args: string[]) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const result = await ffspawn("ffmpeg", null, args);

      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("didn't get string result from ffmpeg"));
      }
    } catch (err) {
      reject(err);
    }
  });
};

export const probeFileData = async (filepath: string): Promise<FFProbeOutputType> => {
  const result = await ffprobe(filepath, ["-show_format", "-show_streams", "-print_format", "json"]);
  return JSON.parse(result);
};

// Necessary when a video file's stream is missing the bit_rate value
export const probeFileVideoBitrate = async (
  filepath: string,
  streamIndex: number,
  formatDuration?: string
): Promise<number> => {
  const result = await ffprobe(filepath, [
    "-select_streams",
    `${streamIndex}`,
    "-show_entries",
    "packet=size:stream=duration",
    "-of",
    "compact=p=0:nk=1",
  ]);

  const lines = result.split("\n").filter((l) => l.length > 0);

  // Each line is a packet size, last line is the duration as a float
  let sum = 0;
  let bitrate = 0;
  for (const line of lines) {
    if (line.indexOf(".") !== -1) {
      const duration = parseFloat(line);

      if (duration) {
        bitrate = sum / duration;
      }

      break;
    } else {
      const value = parseInt(line);

      if (!isNaN(value)) {
        sum += value;
      }
    }
  }

  if (bitrate === 0 && sum > 0 && formatDuration) {
    bitrate = sum / parseFloat(formatDuration);
  }

  // Packets are in bytes but the bit_rate value reported in
  // "streams" when using ffprobe is in bits, so let's use bits
  return Math.floor(bitrate * 8);
};
