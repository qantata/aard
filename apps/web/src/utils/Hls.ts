// @ts-ignore mux.js doesn't have typings :(
import muxjs from "mux.js";

export class Hls {
  private playlistUrl: string;
  private source: MediaSource;
  private sourceBuffer: SourceBuffer | null = null;

  // TODO: Should parse this from the manifest file
  private mime = 'video/mp4;codecs="avc1.640029,mp4a.40.2"';

  private index: number = 0;
  private initSegment!: Uint8Array;
  private muxer: muxjs;
  private duration = 0;
  private segments: string[] = [];
  private segmentDuration = 0;

  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement, playlistUrl: string) {
    this.video = video;
    this.playlistUrl = playlistUrl;
    this.source = new MediaSource();
    this.muxer = new muxjs.mp4.Transmuxer();

    this.video.addEventListener("error", (err) => {
      console.error("Video error:", this.video.error?.message);
    });

    this.fetchAndParsePlaylist().then(() => {
      console.log("Parsed playlist file");

      this.video.src = URL.createObjectURL(this.source);
      this.source.addEventListener("sourceopen", this.onSourceOpen);
    });
  }

  // Very simple parser for the manifest file
  // TODO: Add error checks. For now we know that the server
  // creates valid files, but maybe in the future we want to allow
  // any manifest files.
  private fetchAndParsePlaylist = async () => {
    const data = await fetch(this.playlistUrl);
    const text = await data.text();

    const lines = text.split("\n");
    for (const [index, line] of lines.entries()) {
      if (line.startsWith("#EXT-X-TARGETDURATION:")) {
        this.segmentDuration = parseInt(line.replace("#EXT-X-TARGETDURATION:", ""));
      }

      if (line.startsWith("#EXTINF:")) {
        this.duration += parseFloat(line.replace("#EXTINF:", ""));
        this.segments.push(lines[index + 1]);
      }
    }
  };

  private onSourceOpen = async () => {
    this.sourceBuffer = this.source.addSourceBuffer(this.mime);
    this.sourceBuffer.mode = "segments";

    this.source.duration = this.duration;

    this.sourceBuffer.addEventListener("updateend", this.fetchNextSegment);

    this.muxer.on("error", (err: any) => {
      console.error(err);
    });

    this.muxer.on("data", (initSegment: any) => {
      // The initial segment needs additional data
      let data = new Uint8Array(initSegment.initSegment.byteLength + initSegment.data.byteLength);
      data.set(initSegment.initSegment, 0);
      data.set(initSegment.data, initSegment.initSegment.byteLength);

      // All the other segments can just be appended
      this.muxer.off("data");
      this.muxer.on("data", (segment: any) => {
        if (this.sourceBuffer) {
          console.log("Appending segment", this.index - 1);
          this.sourceBuffer.appendBuffer(new Uint8Array(segment.data));

          // If there's more than 1 buffer, it probably means that the segments that
          // the buffer recieved were uncomplete, and can result in playback stall or
          // playback skipping.
          if (this.sourceBuffer.buffered.length > 1) {
            console.error("There are more than 1 buffers. Something's probably wrong");
          }
        }
      });

      this.sourceBuffer?.appendBuffer(data);
    });

    await this.fetchNextSegment();
  };

  private fetchNextSegment = async () => {
    if (this.index === this.segments.length) {
      console.log("Finished loading segments");
      this.sourceBuffer?.removeEventListener("updateend", this.fetchNextSegment);

      return;
    }

    // TODO: Probably shouldn't hardcode index.m3u8
    const fileUrl = this.playlistUrl.replace("index.m3u8", this.segments[this.index++]);
    const res = await fetch(fileUrl);
    const buf = await res.arrayBuffer();

    this.muxer.push(new Uint8Array(buf));
    this.muxer.flush();
  };
}
