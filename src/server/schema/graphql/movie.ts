import { extendType, objectType } from "nexus";

import { Movie as PMovie } from "nexus-prisma";

export const Movie = objectType({
  name: PMovie.$name,
  description: PMovie.$description,
  definition(t) {
    t.field(PMovie.id);
    t.field(PMovie.title);
    t.field(PMovie.library);
    t.field(PMovie.files);
  },
});

export const QueryMovies = extendType({
  type: "Query",
  definition(t) {
    t.list.field("movies", {
      type: PMovie.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.movie.findMany();
      },
    });
  },
});
