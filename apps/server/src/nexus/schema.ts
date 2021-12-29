import { IS_PKG, PKG_SERVER_DIR } from "@/utils/constants";
import { makeSchema } from "nexus";
import * as path from "path";

import * as types from "./graphql";

const sourceTypesPath = path.join(
  IS_PKG ? PKG_SERVER_DIR : process.cwd(),
  "node_modules",
  ".prisma",
  "client",
  "index.d.ts"
);

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "src", "nexus", "nexus.d.ts"),
  },
  sourceTypes: {
    modules: [{ module: sourceTypesPath, alias: "prisma" }],
    debug: process.env.NODE_ENV === "development",
  },
  contextType: {
    module: path.join(process.cwd(), "src", "nexus", "context.ts"),
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
