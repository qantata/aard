import { extendType, inputObjectType, objectType, stringArg } from "nexus";
import * as fse from "fs-extra";
import * as path from "path";

import {
  VideoStreamProfile as PVideoStreamProfile,
  VideoStreamSession as PVideoStreamSession,
} from "@lib/nexus-prisma";
import { parseProbeDataString } from "@/utils/ffprobe-transformer";
import { getSessionStreamPath } from "@/utils/paths";
import { handleSessionDeletion } from "@/utils/transcode-manager";

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

export const QueryVideoStreamSession = extendType({
  type: "Query",
  definition(t) {
    t.nullable.field("videoStreamSession", {
      type: PVideoStreamSession.$name,
      args: {
        id: stringArg(),
      },
      async resolve(_root, args, ctx) {
        return await ctx.prisma.videoStreamSession.findUnique({
          where: {
            id: args.id,
          },
          include: {
            clients: {
              include: {
                profiles: true,
              },
            },
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
    t.int("level");
    t.string("profile");
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

export const MutationDeleteVideoStreamSession = extendType({
  type: "Mutation",
  definition(t) {
    t.field("deleteVideoStreamSession", {
      type: "Boolean",
      args: {
        id: stringArg(),
      },
      async resolve(_root, args, ctx) {
        try {
          await ctx.prisma.videoStreamSession.delete({
            where: {
              id: args.id,
            },
          });

          // Make sure to kill transcoders
          handleSessionDeletion(args.id);
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
          include: {
            file: true,
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

        const resolutions = [
          {
            width: 3840,
            bitrate: 11600,
          },
          {
            width: 1920,
            bitrate: 6000,
          },
          {
            width: 1280,
            bitrate: 3000,
          },
          {
            width: 960,
            bitrate: 2000,
          },
          {
            width: 854,
            bitrate: 1100,
          },
          {
            width: 640,
            bitrate: 365,
          },
          {
            width: 426,
            bitrate: 145,
          },
        ];

        const streamDir = getSessionStreamPath(session.id);

        let masterManifest = "";
        masterManifest += "#EXTM3U\n";

        // Transcode profiles
        for (const res of resolutions) {
          if (res.width <= probeData.videoStreams[0].width) {
            const width = res.width;
            // Keep aspect ratio
            const height = Math.round((probeData.videoStreams[0].height / probeData.videoStreams[0].width) * res.width);
            const videoBitrate = res.bitrate; //Math.min(probeData.videoStreams[0].bitRate, res.bitrate);
            const audioBitrate = probeData.audioStreams.length ? probeData.audioStreams[0].bitRate : undefined;

            const profile = await ctx.prisma.videoStreamProfile.create({
              data: {
                id: `profile${Math.random() * 1000000}`,
                isHls: true,
                width,
                height,
                videoCodec: "h264",
                videoBitrate,
                audioCodec: probeData.audioStreams.length ? "aac" : undefined,
                audioBitrate,
                client: {
                  connect: {
                    id: client.id,
                  },
                },
              },
            });

            const profileDir = getSessionStreamPath(session.id, profile.id);
            await fse.ensureDir(profileDir);

            const segmentDuration = 2;
            let manifest = "";
            manifest += "#EXTM3U\n";
            manifest += "#EXT-X-PLAYLIST-TYPE:VOD\n";
            manifest += `#EXT-X-TARGETDURATION:${segmentDuration}\n`;
            manifest += "#EXT-X-MEDIA-SEQUENCE:0\n";
            manifest += "#EXT-X-VERSION:3\n";

            let duration = probeData.videoStreams[0].duration || probeData.containerDuration;
            if (!duration) {
              console.error("Duration not found");
              return null;
            }

            let index = 0;
            for (; duration >= segmentDuration; duration -= segmentDuration) {
              manifest += `#EXTINF:${segmentDuration}.000000,\n`;
              manifest += `${index++}.ts\n`;
            }

            if (duration > 0) {
              manifest += `#EXTINF:${duration.toFixed(6)},\n`;
              manifest += `${index}.ts\n`;
            }

            manifest += "#EXT-X-ENDLIST\n";

            await fse.writeFile(path.join(profileDir, "index.m3u8"), manifest);

            // Add an additional 15% to bandwith to count for container
            const bandwith = Math.floor((videoBitrate + (audioBitrate ?? 0)) * 1.15);
            masterManifest += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwith},RESOLUTION=${width}x${height}\n`;
            masterManifest += `${path.join(profileDir.replace(streamDir, ""), "index.m3u8").slice(1)}\n`;
          }
        }

        await fse.ensureDir(streamDir);
        await fse.writeFile(path.join(streamDir, "index.m3u8"), masterManifest);

        return session;
      },
    });
  },
});
