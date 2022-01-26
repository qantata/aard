import { forwardRef, Module } from "@nestjs/common";

import { FFmpegModule } from "@/ffmpeg/ffmpeg.module";
import { FilesystemModule } from "@/filesystem/filesystem.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { LibraryService } from "./library.service";

@Module({
  imports: [FilesystemModule, FFmpegModule, forwardRef(() => PrismaModule)],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
