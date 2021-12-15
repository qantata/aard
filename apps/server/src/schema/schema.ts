import { makeSchema } from "nexus";
import path from "path";

import { IS_PKG, PKG_SERVER_DIR } from "../utils/constants";
import * as types from "./graphql";

const sourceTypesPath = IS_PKG
  ? path.join(PKG_SERVER_DIR, "node_modules", ".prisma", "client", "index.d.ts")
  : path.join(process.cwd(), "node_modules", ".prisma", "client", "index.d.ts");

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "src", "nexus.d.ts"),
  },
  sourceTypes: {
    modules: [{ module: sourceTypesPath, alias: "prisma" }],
    debug: process.env.NODE_ENV === "development",
  },
  contextType: {
    module: path.join(process.cwd(), "src", "context.ts"),
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
