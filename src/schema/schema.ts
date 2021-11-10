import { makeSchema, queryType } from "nexus";
import path from "path";

import { Library as PLibrary } from "nexus-prisma";
import { Movie as PMovie } from "nexus-prisma";
import { Library } from "./Library";
import { Movie } from "./Movie";

const Query = queryType({
  definition(t) {
    t.list.field("libraries", {
      type: PLibrary.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.library.findMany();
      },
    });
    t.list.field("movies", {
      type: PMovie.$name,
      async resolve(_root, _args, ctx) {
        return await ctx.prisma.movie.findMany();
      },
    });
  },
});

export const schema = makeSchema({
  types: [Query, Movie, Library],
  shouldGenerateArtifacts: true, //process.env.NODE_ENV === "development",
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "nexus.ts"),
  },
  sourceTypes: {
    modules: [{ module: ".prisma/client", alias: "prisma" }],
    debug: true, //process.env.NODE_ENV === "development",
  },
  contextType: {
    module: path.join(process.cwd(), "src", "context.ts"),
    export: "Context",
  },
  nonNullDefaults: {
    input: true,
    output: true,
  },
  features: {
    abstractTypeStrategies: {
      resolveType: false,
      isTypeOf: true,
    },
  },
});
