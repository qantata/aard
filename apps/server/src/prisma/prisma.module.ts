import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { LibraryModule } from "@/library/library.module";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [ConfigModule, forwardRef(() => LibraryModule)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
