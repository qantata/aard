import { extendType, objectType } from "nexus";

import { Library as PLibrary } from "nexus-prisma";

export const Library = objectType({
  name: PLibrary.$name,
  description: PLibrary.$description,
  definition(t) {
    t.field(PLibrary.id);
    t.field(PLibrary.root);
  },
});

export const QueryLibraries = extendType({
  type: "Query",
  definition(t) {
    t.list.field("libraries", {
      type: PLibrary.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.library.findMany();
      },
    });
  },
});
