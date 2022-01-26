import { FFmpegService } from "@/ffmpeg/ffmpeg.service";
import { FilesystemService } from "@/filesystem/filesystem.service";
import { UtilsService } from "@/utils/utils.service";
import { PrismaClient } from ".prisma/client";
import { VideoStreamSessionManagerService } from "@/video-stream-session-manager/video-stream-session-manager.service";

export interface Context {
  prisma: PrismaClient;
  utils: UtilsService;
  ffmpeg: FFmpegService;
  filesystem: FilesystemService;
  videoStreamSessionManager: VideoStreamSessionManagerService;
}
