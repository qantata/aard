import { Module } from "@nestjs/common";

import { GraphqlConfigService } from "./graphql-config.service";

@Module({
  providers: [GraphqlConfigService],
})
export class GraphqlConfigModule {}
