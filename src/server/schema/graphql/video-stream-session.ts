import { extendType, inputObjectType, nonNull, objectType, stringArg } from "nexus";

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

const ProfileContainersInput = inputObjectType({
  name: "ProfileContainersInput",
  definition(t) {
    t.nullable.boolean("mp4");
    t.nullable.boolean("mkv");
    t.nullable.boolean("webm");
    t.nullable.boolean("ts");
  },
});

const ProfileH264Input = inputObjectType({
  name: "ProfileH264Input",
  definition(t) {
    t.nonNull.int("level");
    t.nonNull.string("profile");
  },
});

const ProfileVideoCodecsInput = inputObjectType({
  name: "ProfileVideoCodecsInput",
  definition(t) {
    t.nullable.field("h264", {
      type: ProfileH264Input,
    });
  },
});

const ProfileAudioCodecsInput = inputObjectType({
  name: "ProfileAudioCodecsInput",
  definition(t) {
    t.nullable.boolean("flac");
    t.nullable.boolean("aac");
    t.nullable.boolean("ac3");
    t.nullable.boolean("mp3");
  },
});

const ClientStreamProfileInput = inputObjectType({
  name: "ClientStreamProfileInput",
  definition(t) {
    t.field("containers", {
      type: ProfileContainersInput,
    });
    t.field("videoCodecs", {
      type: ProfileVideoCodecsInput,
    });
    t.field("audioCodecs", {
      type: ProfileAudioCodecsInput,
    });
  },
});

export const MutationCreateVideoStreamSession = extendType({
  type: "Mutation",
  definition(t) {
    t.nullable.field("createVideoStreamSession", {
      type: PVideoStreamSession.$name,
      args: {
        entryId: stringArg(),
        profile: ClientStreamProfileInput.asArg(),
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

        // TODO: Error handling
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
