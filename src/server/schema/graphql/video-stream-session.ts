import { extendType, inputObjectType, objectType, stringArg } from "nexus";

import { VideoStreamSession as PVideoStreamSession, VideoStreamProfile } from "nexus-prisma";
import { parseProbeDataString } from "../../utils/ffprobe-transformer";

export const VideoStreamSession = objectType({
  name: "VideoStreamSession",
  definition(t) {
    t.field(PVideoStreamSession.id);
    t.field(PVideoStreamSession.file);
    t.field(PVideoStreamSession.clients);
  },
});

export const QueryVideoStreamSessions = extendType({
  type: "Query",
  definition(t) {
    t.list.field("videoStreamSessions", {
      type: PVideoStreamSession.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.videoStreamSession.findMany({
          include: {
            file: true,
            clients: true,
          },
        });
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

export const MutationDeleteVideoStreamSessions = extendType({
  type: "Mutation",
  definition(t) {
    t.field("deleteVideoStreamSessions", {
      type: "Boolean",
      async resolve(_root, _args, ctx) {
        try {
          await ctx.prisma.videoStreamSession.deleteMany();
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
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
            files: true,
          },
        });

        // TODO: Error handling
        if (!entry) {
          return null;
        }

        const probeData = parseProbeDataString(entry.files[0].probeData);
        let isContainerCompatible = false;
        let isVideoCodecCompatible = false;
        let isAudioCodecCompatible = false;

        // @ts-ignore TODO: Try to make these TS safe
        if (args.profile.containers[probeData.container]) {
          isContainerCompatible = true;
        }

        // @ts-ignore
        if (args.profile.videoCodecs[probeData.videoStreams[0].codec]) {
          isVideoCodecCompatible = true;
        }

        // @ts-ignore
        if (probeData.audioStreams.length === 0 || args.profile.audioCodecs[probeData.audioStreams[0].codec]) {
          isAudioCodecCompatible = true;
        }

        const session = await ctx.prisma.videoStreamSession.create({
          data: {
            id: `video-stream-session${Math.random() * 1000000}`,
            file: {
              connect: {
                id: entry.files[0].id,
              },
            },
          },
        });

        const client = await ctx.prisma.videoStreamSessionClient.create({
          data: {
            id: `client${Math.random() * 1000000}`,
            isOwner: true,
            videoStreamSession: {
              connect: {
                id: session.id,
              },
            },
          },
        });

        // Direct play
        if (isContainerCompatible && isVideoCodecCompatible && isAudioCodecCompatible) {
          await ctx.prisma.videoStreamProfile.create({
            data: {
              id: `profile${Math.random() * 1000000}`,
              isHls: false,
              width: probeData.videoStreams[0].width,
              height: probeData.videoStreams[0].height,
              container: probeData.container,
              videoCodec: probeData.videoStreams[0].codec,
              videoBitrate: probeData.videoStreams[0].bitRate,
              audioCodec: probeData.audioStreams.length ? probeData.audioStreams[0].codec : undefined,
              audioBitrate: probeData.audioStreams.length ? probeData.audioStreams[0].bitRate : undefined,
              client: {
                connect: {
                  id: client.id,
                },
              },
            },
          });
        }

        // Transcode
        await ctx.prisma.videoStreamProfile.create({
          data: {
            id: `profile${Math.random() * 1000000}`,
            isHls: true,
            width: probeData.videoStreams[0].width,
            height: probeData.videoStreams[0].height,
            videoCodec: "h264",
            videoBitrate: probeData.videoStreams[0].bitRate,
            audioCodec: probeData.audioStreams.length ? "aac" : undefined,
            audioBitrate: probeData.audioStreams.length ? probeData.audioStreams[0].bitRate : undefined,
            client: {
              connect: {
                id: client.id,
              },
            },
          },
        });

        return session;
      },
    });
  },
});
