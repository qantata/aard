import { spawn } from "child_process";

const ffspawn = async (cmd: "ffmpeg" | "ffprobe", filepath: string | null, args: string[]) => {
  return new Promise<string | Object>((resolve, reject) => {
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
      const data = stdoutData.join("");
      const formatIndex = args.indexOf("-print_format");

      // JSON format
      if (formatIndex !== -1 && args.length >= formatIndex + 2 && args[formatIndex + 1] === "json") {
        resolve(JSON.parse(data));
      } else {
        resolve(data);
      }
    });
  });
};

export const ffprobe = async (filepath: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await ffspawn("ffprobe", filepath, ["-show_format", "-show_streams", "-print_format", "json"]);
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
