import { Injectable } from "@nestjs/common";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as chokidar from "chokidar";
import * as fse from "fs-extra";
import * as path from "path";
import * as os from "os";

export type RequestSegmentOptions = {
  segment: number;
  filepath: string;
  outDir: string;
  width: number;
  fps?: number;
  videoStreamIndex: number;
  audioStreamIndex?: number;
  videoBitrate?: number;
  audioBitrate?: number;
};

export enum RequestSegmentReturnType {
  SEGMENT_EXISTS,
  SEGMENT_IN_QUEUE,
}

@Injectable()
export class TranscoderService {
  private filepath: string;
  private outDir: string;

  // We need to change the directory where we transcode files
  // when the transcoder restarts, because when an ffmpeg process
  // exits, it will spit out an unfinished file and we don't want to
  // pick that up with our file watcher. So we change the directory
  // and start watching that directory instead.
  private transcodeDirNumber: number = 0;

  private process: ChildProcessWithoutNullStreams | null = null;

  // The next segment is the segment that the transcoder
  // expects the client to request next. This really only works
  // with clients that request the segments sequentially, and not
  // in parallel
  private nextSegment: number = -1;
  private currentSegment: number = -1;
  private finishedSegments: { [segment: number]: boolean } = {};

  private watcher: chokidar.FSWatcher | null = null;
  private onSegmentTranscodedCallback: ((segment: number) => void) | null = null;

  private videoStreamIndex: number;
  private audioStreamIndex?: number;

  private fps?: number;
  private width?: number;
  private videoBitrate?: number;
  private audioBitrate?: number;

  private async enableWatcher() {
    return new Promise<void>((resolve) => {
      const dir = path.join(this.outDir, String(this.transcodeDirNumber));
      fse.ensureDirSync(dir);

      this.watcher = chokidar
        .watch(dir, {
          ignoreInitial: true,
          // Important so that we don't send incomplete segments!
          // We're using the default values right now, which will
          // delay sending the segments by about 2000ms.
          // TODO: Find more optimal values.
          awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100,
          },
        })
        .on("add", async (filepath, _event) => {
          const filename = path.basename(filepath);
          const dir = path.dirname(filepath);

          // Because of the delay caused by awaitWriteFinish,
          // the "add" event can be fired after we started
          // transcoding at a new point, so we need to do a check
          // here.
          const dirNumber = parseInt(dir.slice(dir.lastIndexOf("/") + 1));
          if (dirNumber !== this.transcodeDirNumber) {
            return;
          }

          const segmentNr = parseInt(filename);
          this.currentSegment = segmentNr + 1;

          try {
            const dist = path.join(dir, "..", `${segmentNr}.ts`);

            // The file can exist already if the client seeked forward and then
            // back again, and then it later catches up with the buffered
            // region later in the video. We have to re-transcode it because
            // -ss with ffmpeg doesn't really work as expected and there will
            // be audio issues at the very least where the 2 regions meet.
            await fse.move(filepath, dist, { overwrite: true });
            this.finishedSegments[segmentNr] = true;
            this.onSegmentTranscodedCallback?.(segmentNr);
          } catch (err) {
            console.error(err);
          }
        })
        .on("ready", resolve);
    });
  }

  private async disableWatcher() {
    await this.watcher?.close();
  }

  private startTranscode() {
    const segmentDuration = 2;
    const seconds = this.currentSegment * segmentDuration;
    console.log("Transcoding from", seconds, "seconds");

    let args = [
      "-ss",
      `${seconds}`,
      "-noaccurate_seek",
      "-i",
      `${this.filepath}`,
      "-map",
      `0:${this.videoStreamIndex}`,
    ];

    if (this.audioStreamIndex) {
      args = [
        ...args,
        "-map",
        `0:${this.audioStreamIndex}`,
        "-c:a",
        "aac",
        // TODO: Use as many channels as are supported by client
        "-ac",
        "2",
      ];
    }

    args = [
      ...args,
      "-map_metadata",
      "-1",
      "-map_chapters",
      "-1",
      // TODO: What is the optimal value? -threads 0 has been buggy,
      // but maybe this isn't optimal either
      "-threads",
      `${os.cpus().length / 2}`,
      // TODO: Subtitles
      "-sn",
      "-c:v",
      "libx264",
      // TODO: HDR support
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-profile:v",
      "high",
      "-level",
      "41",
    ];

    if (this.width) {
      args = [...args, "-vf", `scale=${this.width}:-2`];
    }

    if (this.videoBitrate) {
      args = [...args, "-b:v", `${this.videoBitrate}`];
    }

    if (this.audioBitrate) {
      args = [...args, "-b:a", `${this.audioBitrate}`];
    }

    // Key interval - this is important when seeking
    if (this.fps) {
      const keyint = Math.ceil(this.fps * segmentDuration);
      args = [...args, "-x264opts:0", `keyint=${keyint}:min-keyint=${keyint}:scenecut=0`];
    }

    args = [
      ...args,
      "-force_key_frames",
      `expr:gte(t,${this.currentSegment}+n_forced*${segmentDuration})`,
      // Needed for seeking
      "-start_at_zero",
      // Not sure if needed
      "-vsync",
      "-1",
      // Needed for seeking
      "-copyts",
      "-avoid_negative_ts",
      "disabled",
      // This hasn't been tested, but should be safer than without it
      "-max_muxing_queue_size",
      "2048",
      "-f",
      "hls",
      "-hls_time",
      `${segmentDuration}`,
      // TODO: Maybe support fmp4 for flac audio?
      "-hls_segment_type",
      "mpegts",
      // For seeking
      "-start_number",
      `${this.currentSegment}`,
      "-hls_segment_filename",
      `${path.join(this.outDir, String(this.transcodeDirNumber), "%d.ts")}`,
      "-hls_playlist_type",
      "vod",
      "-y",
      // This is a dummy file that isn't used for anything, but ffmpeg requires an output
      path.join(this.outDir, "index_ffmpeg.m3u8"),
    ];

    console.log("ffmpeg", args.join(" "));
    console.log();

    this.process = spawn("ffmpeg", args);

    this.process.stdout.setEncoding("utf8");
    this.process.stderr.setEncoding("utf8");

    // TODO: Should probably save outputs to a temporary log file
    this.process.stderr.on("data", (data) => {
      //console.log(data);
    });

    this.process.stdout.on("data", (data) => {
      console.log("Data:", data);
    });

    this.process.on("exit", (code) => {
      //console.log("Transcoder exited with code", code);
    });
    this.process.on("error", (err) => {
      console.error(err);
    });
    this.process.on("close", () => {
      //console.log("Transcoder closed");
    });
  }

  async requestSegment(options: RequestSegmentOptions) {
    let paramsChanged = false;

    if (
      this.filepath !== options.filepath ||
      this.outDir !== options.outDir ||
      this.width !== options.width ||
      this.fps !== options.fps ||
      this.videoStreamIndex !== options.videoStreamIndex ||
      this.audioStreamIndex !== options.audioStreamIndex ||
      this.videoBitrate !== options.videoBitrate ||
      this.audioBitrate !== this.audioBitrate
    ) {
      paramsChanged = true;
      this.filepath = options.filepath;
      this.outDir = options.outDir;
      this.width = options.width;
      this.fps = options.fps;
      this.videoStreamIndex = options.videoStreamIndex;
      this.audioStreamIndex = options.audioStreamIndex;
      this.videoBitrate = options.videoBitrate;
      this.audioBitrate = options.audioBitrate;
    }

    // If params changed, skip these checks so that we restart transcoder
    if (!paramsChanged) {
      const isNextSegment = options.segment === this.nextSegment;
      const isInProcessSegment = options.segment >= this.currentSegment && options.segment < this.nextSegment;

      if (isNextSegment) {
        this.nextSegment++;
      }

      if (this.finishedSegments[options.segment]) {
        return RequestSegmentReturnType.SEGMENT_EXISTS;
      }

      if (isNextSegment) {
        return RequestSegmentReturnType.SEGMENT_IN_QUEUE;
      }

      if (isInProcessSegment) {
        return RequestSegmentReturnType.SEGMENT_IN_QUEUE;
      }
    }

    console.log({
      width: options.width,
      fps: options.fps,
      videoStreamIndex: options.videoStreamIndex,
      audioStreamIndex: options.audioStreamIndex,
      videoBitrate: options.videoBitrate,
      audioBitrate: options.audioBitrate,
    });

    this.finishedSegments = {};

    await this.disableWatcher();
    this.process?.kill();
    this.currentSegment = options.segment;

    this.nextSegment = options.segment + 1;
    this.transcodeDirNumber++;

    await this.enableWatcher();
    this.startTranscode();

    return false;
  }

  onSegmentTranscoded(callback: (segment: number) => void) {
    this.onSegmentTranscodedCallback = callback;
  }

  destroy() {
    console.log("Destroying transcoder");
    this.disableWatcher();
    this.process?.kill();
  }
}
