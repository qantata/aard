import { Controller, Get, HttpStatus, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";

import { context } from "@/nexus/context";
import { getSessionStreamPath } from "@/utils/paths";
import { handleStreamSegmentRequest } from "@/utils/transcode-manager";
import { parseProbeDataString } from "@/utils/ffprobe-transformer";
import { VideoStreamSessionManagerService } from "@/video-stream-session-manager/video-stream-session-manager.service";

@Controller()
export class VideoStreamSessionController {
  constructor(private videoStreamSessionManager: VideoStreamSessionManagerService) {}

  @Get(":id/direct")
  async direct(@Res() res: Response, @Param("id") id: string) {
    const session = await context().prisma.videoStreamSession.findUnique({
      where: {
        id,
      },
      include: {
        file: true,
      },
    });

    if (!session) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      res.sendFile(session.file.path);
    }
  }

  @Get(":sessionId/:file")
  async sessionFile(@Res() res: Response, @Param("sessionId") sessionId: string, @Param("file") file: string) {
    const session = await context().prisma.videoStreamSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      res.sendFile(path.join(getSessionStreamPath(session.id), file));
    }
  }

  @Get(":sessionId/streams/:streamId/:file")
  async streamFile(
    @Res() res: Response,
    @Param("sessionId") sessionId: string,
    @Param("streamId") streamId: string,
    @Param("file") file: string
  ) {
    const session = await context().prisma.videoStreamSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        file: true,
        clients: {
          include: {
            profiles: true,
          },
        },
      },
    });

    if (!session) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    // TODO: Don't just use [0]
    const profile = session.clients[0].profiles.find((p: any) => p.id === streamId);

    if (!profile) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    const filepath = getSessionStreamPath(session.id, profile.id, file);

    // Requested files can be .m3u8 or .ts, .ts needs transcoding
    if (file.endsWith(".ts")) {
      await this.videoStreamSessionManager.resolveStreamSegmentRequest(session, profile, parseInt(file));
    }

    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }
}
