import { Module } from "@nestjs/common";

import { VideoStreamSessionService } from "./video-stream-session.service";
import { VideoStreamSessionController } from "./video-stream-session.controller";
import { VideoStreamSessionManagerModule } from "@/video-stream-session-manager/video-stream-session-manager.module";
import { UtilsModule } from "@/utils/utils.module";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
  imports: [VideoStreamSessionManagerModule, UtilsModule, PrismaModule],
  providers: [VideoStreamSessionService],
  controllers: [VideoStreamSessionController],
})
export class VideoStreamSessionModule {}
