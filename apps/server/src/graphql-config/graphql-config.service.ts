import { Injectable } from "@nestjs/common";
import { GqlOptionsFactory, GqlModuleOptions } from "@nestjs/graphql";

import { schema } from "@/nexus/schema";
import { context } from "@/nexus/context";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory {
  constructor(private prisma: PrismaService) {}

  async createGqlOptions(): Promise<GqlModuleOptions> {
    // We should (probably?) migrate before passing prisma to Apollo server
    // Not sure if this is the best place to do this
    await this.prisma.migrate();

    return {
      debug: true,
      playground: true,
      schema,
      context,
    };
  }
}
