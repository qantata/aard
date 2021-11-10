import { makeSchema } from "nexus";
import path from "path";

import * as types from "./graphql";

export const schema = makeSchema({
  types,
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
