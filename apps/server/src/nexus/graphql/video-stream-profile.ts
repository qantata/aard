import { extendType, objectType } from "nexus";

import { VideoStreamProfile as PVideoStreamProfile } from "@lib/nexus-prisma";

export const VideoStreamProfile = objectType({
  name: PVideoStreamProfile.$name,
  definition(t) {
    t.field(PVideoStreamProfile.id);
    t.field(PVideoStreamProfile.isHls);
    t.field(PVideoStreamProfile.width);
    t.field(PVideoStreamProfile.height);
    t.field(PVideoStreamProfile.container);
    t.field(PVideoStreamProfile.videoCodec);
    t.field(PVideoStreamProfile.videoBitrate);
    t.field(PVideoStreamProfile.audioCodec);
    t.field(PVideoStreamProfile.audioBitrate);
    t.field(PVideoStreamProfile.client);
  },
});

export const QueryVideoStreamProfiles = extendType({
  type: "Query",
  definition(t) {
    t.list.field("videoStreamProfiles", {
      type: PVideoStreamProfile.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.videoStreamProfile.findMany();
      },
    });
  },
});
