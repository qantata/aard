import { extendType, nonNull, objectType, stringArg } from "nexus";

import { Library as PLibrary } from "@lib/nexus-prisma";
import { isDirectory } from "@/utils/filesystem";

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
    t.nullable.field("createLibrary", {
      type: PLibrary.$name,
      args: {
        root: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const isDir = await isDirectory(args.root);
        // TODO: Send an actual error instead of just null
        if (!isDir) {
          return null;
        }

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

    t.nullable.field("deleteLibrary", {
      type: PLibrary.$name,
      args: {
        id: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        try {
          const library = await ctx.prisma.library.delete({
            where: {
              id: args.id,
            },
          });

          return library;
        } catch (err) {
          console.error("Couldn't delete library:", err);
          return null;
        }
      },
    });
  },
});
