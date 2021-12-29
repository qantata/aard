import { TranscoderModule } from "@/transcoder/transcoder.module";
import { Module } from "@nestjs/common";
import { VideoStreamSessionManagerService } from "./video-stream-session-manager.service";

@Module({
  imports: [TranscoderModule],
  providers: [VideoStreamSessionManagerService],
  exports: [VideoStreamSessionManagerService],
})
export class VideoStreamSessionManagerModule {}
