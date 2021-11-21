import { extendType, nonNull, objectType, stringArg } from "nexus";

import { VideoStreamSession as PVideoStreamSession } from "nexus-prisma";

export const VideoStreamSession = objectType({
  name: PVideoStreamSession.$name,
  description: PVideoStreamSession.$description,
  definition(t) {
    t.field(PVideoStreamSession.id);
    t.field(PVideoStreamSession.file);
  },
});

export const QueryVideoStreamSessions = extendType({
  type: "Query",
  definition(t) {
    t.list.field("videoStreamSessions", {
      type: PVideoStreamSession.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.videoStreamSession.findMany();
      },
    });
  },
});

export const MutationCreateVideoStreamSession = extendType({
  type: "Mutation",
  definition(t) {
    t.nullable.field("createVideoStreamSession", {
      type: PVideoStreamSession.$name,
      args: {
        entryId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        // TODO: For now we only have movies but update this if more video types are added
        const entry = await ctx.prisma.movie.findUnique({
          where: {
            id: args.entryId,
          },
          include: {
            file: true,
          },
        });

        if (!entry) {
          return null;
        }

        const session = await ctx.prisma.videoStreamSession.create({
          data: {
            id: `video-stream-session${Math.random() * 1000000}`,
            file: {
              connect: {
                id: entry.file.id,
              },
            },
          },
        });

        return session;
      },
    });
  },
});
