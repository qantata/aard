import { queryType } from "nexus";

import { Library, Movie } from "nexus-prisma";

export const Query = queryType({
  definition(t) {
    t.list.field("libraries", {
      type: Library.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.library.findMany();
      },
    });
    t.list.field("movies", {
      type: Movie.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.movie.findMany();
      },
    });
  },
});
