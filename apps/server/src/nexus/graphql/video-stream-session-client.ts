import { extendType, objectType } from "nexus";

import { VideoStreamSessionClient as PVideoStreamSessionClient } from "@lib/nexus-prisma";

export const VideoStreamSessionClient = objectType({
  name: PVideoStreamSessionClient.$name,
  definition(t) {
    t.field(PVideoStreamSessionClient.id);
    t.field(PVideoStreamSessionClient.isOwner);
    t.field(PVideoStreamSessionClient.videoStreamSession);
    t.field(PVideoStreamSessionClient.profiles);
  },
});

export const QueryVideoStreamSessionClients = extendType({
  type: "Query",
  definition(t) {
    t.list.field("videoStreamSessionClients", {
      type: PVideoStreamSessionClient.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.videoStreamSessionClient.findMany();
      },
    });
  },
});
