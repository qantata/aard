import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import chokidar from "chokidar";
import fse from "fs-extra";
import path from "path";
import os from "os";

import { VideoProbeResultType } from "./ffprobe-transformer";

export class Transcoder {
  private file: string;
  private outDir: string;
  private probeData: VideoProbeResultType;
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

  constructor(file: string, outDir: string, probeData: VideoProbeResultType) {
    this.file = file;
    this.outDir = outDir;
    this.probeData = probeData;
  }

  private enableWatcher() {
    const dir = path.join(this.outDir, String(this.transcodeDirNumber));
    fse.ensureDirSync(dir);

    if (this.watcher) {
      this.watcher.add(dir);
    } else {
      this.watcher = chokidar.watch(dir).on("add", async (filepath, _event) => {
        const filename = path.basename(filepath);

        const segmentNr = parseInt(filename);
        this.currentSegment = segmentNr + 1;

        try {
          const dir = path.dirname(filepath);
          const dist = path.join(dir, "..", `${segmentNr}.ts`);

          // This can happen if the client seeked forward and then
          // back again, and then it later catches up with the buffered
          // region later in the video. We have to re-transcode it because
          // -ss with ffmpeg doesn't really work as expected and there will
          // be audio issues at the very least where the 2 regions meet.
          if (fse.existsSync(dist)) {
            await fse.remove(dist);
          }

          await fse.move(filepath, dist);
          this.finishedSegments[segmentNr] = true;
          this.onSegmentTranscodedCallback?.(segmentNr);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  private disableWatcher() {
    this.watcher?.unwatch(path.join(this.outDir, String(this.transcodeDirNumber)));
  }

  // TODO: Add video and audio bitrates
  private startTranscode() {
    const segmentDuration = 3;
    const seconds = this.currentSegment * segmentDuration;
    console.log("Transcoding from", seconds, "seconds");

    let args = [
      "-ss",
      `${seconds}`,
      "-noaccurate_seek",
      "-i",
      `${this.file}`,
      "-map",
      `0:${this.probeData.videoStreams[0].index}`,
    ];

    if (this.probeData.audioStreams.length) {
      args = [
        ...args,
        "-map",
        `0:${this.probeData.audioStreams[0].index}`,
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
    ];

    // Key interval - this is important when seeking
    if (this.probeData.videoStreams[0].fps) {
      const keyint = Math.ceil(this.probeData.videoStreams[0].fps * segmentDuration);
      args = [...args, "-x264opts:0", `keyint=${keyint}:min-keyint=${keyint}:scenecut=0`];
    }

    args = [
      ...args,
      "-force_key_frames",
      `expr:gte(t,n_forced*${segmentDuration})`,
      // TODO: Resolution based on profile
      "-vf",
      "scale=1920:-2",
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

  /**
   * @returns {boolean} True if segment already exists, false otherwise
   */
  requestSegment(segment: number) {
    const isNextSegment = segment === this.nextSegment;
    const isInProcessSegment = segment >= this.currentSegment && segment < this.nextSegment;
    console.log("Request", segment);
    if (isNextSegment) {
      this.nextSegment++;
    }

    if (this.finishedSegments[segment]) {
      return true;
    }

    if (isNextSegment) {
      return false;
    }

    if (isInProcessSegment) {
      return false;
    }

    this.finishedSegments = {};
    this.disableWatcher();
    this.process?.kill();
    this.currentSegment = segment;
    this.nextSegment = segment + 1;
    this.transcodeDirNumber++;

    this.enableWatcher();
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
