import { objectType } from "nexus";

import { VideoFile as PVideoFile } from "nexus-prisma";

export const VideoFile = objectType({
  name: PVideoFile.$name,
  description: PVideoFile.$description,
  definition(t) {
    t.field(PVideoFile.id);
    t.field(PVideoFile.path);
  },
});
