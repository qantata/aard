import { Controller, Get, HttpStatus, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";

import { context } from "@/nexus/context";
import { getSessionStreamPath } from "@/utils/paths";
import { handleStreamSegmentRequest } from "@/utils/transcode-manager";
import { parseProbeDataString } from "@/utils/ffprobe-transformer";

@Controller()
export class VideoStreamSessionController {
  @Get(":id/direct")
  async direct(@Req() req: Request, @Res() res: Response, @Param("id") id: string) {
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
  async sessionFile(
    @Req() req: Request,
    @Res() res: Response,
    @Param("sessionId") sessionId: string,
    @Param("file") file: string
  ) {
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
    @Req() req: Request,
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

    const profile = session?.clients[0].profiles.find((p: any) => p.id === streamId);

    if (!session || !profile) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      if (file.endsWith(".m3u8")) {
        res.sendFile(getSessionStreamPath(session.id, profile.id, file));
        return;
      }

      // Wait for segment to be transcoded
      await handleStreamSegmentRequest(
        session.file.path,
        session.id,
        profile.id,
        file,
        parseProbeDataString(session.file.probeData),
        profile.width,
        profile.videoBitrate,
        profile.audioBitrate || undefined
      );

      const segmentFilepath = getSessionStreamPath(session.id, profile.id, file);
      if (fs.existsSync(segmentFilepath)) {
        res.sendFile(segmentFilepath);
      } else {
        res.status(HttpStatus.NOT_FOUND).send();
      }
    }
  }
}
