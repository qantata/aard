import { Module } from '@nestjs/common';
import { VideoStreamSessionService } from './video-stream-session.service';
import { VideoStreamSessionController } from './video-stream-session.controller';

@Module({
  providers: [VideoStreamSessionService],
  controllers: [VideoStreamSessionController]
})
export class VideoStreamSessionModule {}
