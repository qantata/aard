import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { VideoStreamSession, VideoStreamProfile, VideoFile } from ".prisma/client";

import { RequestSegmentOptions, RequestSegmentReturnType, TranscoderService } from "@/transcoder/transcoder.service";
import { getSessionStreamPath } from "@/utils/paths";
import { parseProbeDataString } from "@/utils/ffprobe-transformer";

type Transcoders = {
  [sessionId: string]: TranscoderService;
};

@Injectable()
export class VideoStreamSessionManagerService {
  private transcoders: Transcoders;

  constructor(private moduleRef: ModuleRef) {
    this.transcoders = {};
  }

  async resolveStreamSegmentRequest(
    session: VideoStreamSession & { file: VideoFile },
    profile: VideoStreamProfile,
    segment: number
  ) {
    let transcoder: TranscoderService = this.transcoders[session.id];
    if (!transcoder) {
      transcoder = await this.moduleRef.create(TranscoderService);

      this.transcoders[session.id] = transcoder;
    }

    const probeData = parseProbeDataString(session.file.probeData);

    const options: RequestSegmentOptions = {
      segment,
      filepath: session.file.path,
      outDir: getSessionStreamPath(session.id, profile.id),
      fps: probeData.videoStreams[0].fps,
      videoStreamIndex: probeData.videoStreams[0].index,
      audioStreamIndex: probeData.audioStreams.length ? probeData.audioStreams[0].index : undefined,
      width: profile.width,
    };

    const res = await this.transcoders[session.id].requestSegment(options);

    if (res === RequestSegmentReturnType.SEGMENT_EXISTS) {
      return;
    }

    return new Promise<void>((resolve) => {
      transcoder.onSegmentTranscoded((transcodedSegment) => {
        if (segment === transcodedSegment) resolve();
      });
    });
  }
}
