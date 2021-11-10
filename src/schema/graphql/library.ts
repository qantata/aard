import { extendType, nonNull, objectType, stringArg } from "nexus";

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

export const MutationCreateLibrary = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createLibrary", {
      type: PLibrary.$name,
      args: {
        root: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const library = await ctx.prisma.library.create({
          data: {
            // TODO: Generate id's properly
            id: String(Math.random() * 1000000),
            root: args.root,
          },
        });

        return library;
      },
    });
  },
});
