import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from "path";

export class Transcoder {
  file: string;
  process: ChildProcessWithoutNullStreams;
  nextSegment: number = 0;
  bufferSize: number = 0;
  bufferTarget: number = 5;
  isPaused: boolean = true;

  constructor(file: string, outDir: string) {
    this.file = file;

    const args = [
      "-i",
      `${file}`,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0",
      "-sn",
      "-c:v",
      "libx264",
      "-vf",
      "scale=1920:1080",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-ac",
      "2",
      "-force_key_frames",
      "expr:gte(t,0+n_forced*2)",
      "-f",
      "hls",
      "-hls_time",
      "2",
      "-hls_segment_type",
      "mpegts",
      "-start_number",
      "0",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      `${path.join(outDir, "%d.ts")}`,
      "-threads",
      "16",
      "-y",
      path.join(outDir, "index_ffmpeg.m3u8"),
    ];

    this.process = spawn("ffmpeg", args);

    this.process.stdout.setEncoding("utf8");
    this.process.stderr.setEncoding("utf8");

    this.process.stdout.on("data", (data) => {
      console.log("Data:", data);
    });
    this.process.stderr.on("data", (data) => {
      console.error("Errordata:", data);
    });

    this.process.on("exit", (code) => {});
    this.process.on("error", (err) => {
      console.error(err);
    });
    this.process.on("close", () => {
      console.log("Finished transcoding :)");
    });
  }

  stop() {
    this.process.kill();
  }
}
