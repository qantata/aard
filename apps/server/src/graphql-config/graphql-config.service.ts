import { Injectable } from "@nestjs/common";
import { GqlOptionsFactory, GqlModuleOptions } from "@nestjs/graphql";

import { schema } from "@/nexus/schema";
import { context } from "@/nexus/context";

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory {
  async createGqlOptions(): Promise<GqlModuleOptions> {
    return {
      debug: true,
      playground: true,
      schema,
      context,
    };
  }
}
