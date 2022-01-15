import { Module } from "@nestjs/common";

import { VideoStreamSessionManagerService } from "./video-stream-session-manager.service";
import { FFmpegModule } from "@/ffmpeg/ffmpeg.module";
import { TranscoderModule } from "@/transcoder/transcoder.module";
import { UtilsModule } from "@/utils/utils.module";

@Module({
  imports: [TranscoderModule, FFmpegModule, UtilsModule],
  providers: [VideoStreamSessionManagerService],
  exports: [VideoStreamSessionManagerService],
})
export class VideoStreamSessionManagerModule {}
