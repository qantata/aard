import { makeSchema } from "nexus";
import path from "path";

import * as types from "./graphql";

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "src", "server", "nexus.d.ts"),
  },
  sourceTypes: {
    modules: [{ module: ".prisma/client", alias: "prisma" }],
    debug: process.env.NODE_ENV === "development",
  },
  contextType: {
    module: path.join(process.cwd(), "src", "server", "context.ts"),
    export: "Context",
  },
  nonNullDefaults: {
    input: true,
    output: false,
  },
  features: {
    abstractTypeStrategies: {
      resolveType: false,
      isTypeOf: true,
    },
  },
});
