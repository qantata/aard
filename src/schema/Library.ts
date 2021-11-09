import { objectType } from "nexus";

import { Library as PLibrary } from "nexus-prisma";

export const Library = objectType({
  name: PLibrary.$name,
  description: PLibrary.$description,
  definition(t) {
    t.field(PLibrary.id);
    t.field(PLibrary.root);
  },
});
