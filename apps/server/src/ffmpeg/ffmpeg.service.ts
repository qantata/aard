import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";

export type FFProbeOutputType = {
  streams: {
    index?: number;
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

@Injectable()
export class FFmpegService {
  private decoders: Coders | null = null;
  private encoders: Coders | null = null;
  private demuxers: Muxers | null = null;
  private muxers: Muxers | null = null;
  private demuxerFileExtensions: string[] | null = null;

  setSupportValues(decoders: Coders, encoders: Coders, demuxers: Muxers, muxers: Muxers, extensions: string[]) {
    this.decoders = decoders;
    this.encoders = encoders;
    this.demuxers = demuxers;
    this.muxers = muxers;
    this.demuxerFileExtensions = extensions;
  }

  private getCodersFromFFmpegOutput(output: string[]) {
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
      const codecs = [cols[2]];

      // Sometimes there's an additional codec name at the
      // end of the line
      if (cols[cols.length - 2] === "(codec") {
        codecs.push(cols[cols.length - 1].replace(")", ""));
      }

      for (const codec of codecs) {
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
    }

    return coders;
  }

  private getMuxersFromFFmpegOutput(output: string[]) {
    const muxers: Muxers = {};

    for (const muxer of output) {
      const cols = muxer.split(" ");

      if (cols.length < 4) {
        throw new Error("ffmpeg muxer/demuxer output was unexpected; unsupported version?");
      }

      muxers[cols[3]] = true;
    }

    return muxers;
  }

  private getRelevantLinesFromFFmpegOutput(output: string) {
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
  }

  async getDecoders(): Promise<Coders | null> {
    if (this.decoders !== null) {
      return this.decoders;
    }

    try {
      const result = await this.ffmpeg(["-decoders"]);

      const decoders = this.getRelevantLinesFromFFmpegOutput(result);
      if (!decoders) {
        return null;
      }

      this.decoders = this.getCodersFromFFmpegOutput(decoders);
      return this.decoders;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getEncoders(): Promise<Coders | null> {
    if (this.encoders !== null) {
      return this.encoders;
    }

    try {
      const result = await this.ffmpeg(["-encoders"]);

      const encoders = this.getRelevantLinesFromFFmpegOutput(result);
      if (!encoders) {
        return null;
      }

      this.encoders = this.getCodersFromFFmpegOutput(encoders);
      return this.encoders;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getDemuxers(): Promise<Muxers | null> {
    if (this.demuxers !== null) {
      return this.demuxers;
    }

    try {
      const result = await this.ffmpeg(["-demuxers"]);

      const demuxers = this.getRelevantLinesFromFFmpegOutput(result);
      if (!demuxers) {
        return null;
      }

      this.demuxers = this.getMuxersFromFFmpegOutput(demuxers);
      return this.demuxers;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getMuxers(): Promise<Muxers | null> {
    if (this.muxers !== null) {
      return this.muxers;
    }

    try {
      const result = await this.ffmpeg(["-muxers"]);

      const muxers = this.getRelevantLinesFromFFmpegOutput(result);
      if (!muxers) {
        return null;
      }

      this.muxers = this.getMuxersFromFFmpegOutput(muxers);
      return this.muxers;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getDemuxerFileExtensions(): Promise<string[] | null> {
    if (this.demuxerFileExtensions !== null) {
      return this.demuxerFileExtensions;
    }

    try {
      const demuxers = await this.getDemuxers();
      if (!demuxers) {
        return null;
      }

      let extensions: string[] = [];
      for (let [demuxer, _] of Object.entries(demuxers)) {
        try {
          const result = await this.ffmpeg(["-h", `demuxer=${demuxer}`]);
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
  }

  private async ffspawn(cmd: "ffmpeg" | "ffprobe", filepath: string | null, args: string[]) {
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
  }

  async ffprobe(filepath: string, args?: string[]) {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const result = await this.ffspawn("ffprobe", filepath, args || []);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async ffmpeg(args: string[]) {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const result = await this.ffspawn("ffmpeg", null, args);

        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("didn't get string result from ffmpeg"));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async probeFileData(filepath: string): Promise<FFProbeOutputType> {
    const result = await this.ffprobe(filepath, ["-show_format", "-show_streams", "-print_format", "json"]);
    return JSON.parse(result);
  }

  async probeStreamBitrate(filepath: string, streamIndex: number, formatDuration?: string): Promise<number> {
    const result = await this.ffprobe(filepath, [
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

    if (bitrate === 0) {
      console.error("Failed to get bitrate for file:", filepath);
    }

    // Packets are in bytes but the bit_rate value reported in
    // "streams" when using ffprobe is in bits, so let's use bits
    return Math.floor(bitrate * 8);
  }
}
