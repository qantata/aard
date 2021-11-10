import { objectType } from "nexus";

import { Movie as PMovie } from "nexus-prisma";

export const Movie = objectType({
  name: PMovie.$name,
  description: PMovie.$description,
  definition(t) {
    t.field(PMovie.id);
    t.field(PMovie.title);
    t.field(PMovie.filepath);
  },
});
