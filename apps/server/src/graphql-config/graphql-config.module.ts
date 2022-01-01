import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";
import { GraphqlConfigService } from "./graphql-config.service";

@Module({
  imports: [PrismaModule],
  providers: [GraphqlConfigService],
})
export class GraphqlConfigModule {}
