import { scanNewLibrary } from "./library-scanner";
import { Library } from "nexus-prisma";
import { context } from "./context";

export const applyPrismaMiddleware = () => {
  context().prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === Library.$name && params.action === "create") {
      scanNewLibrary(params.args.data.id, params.args.data.root);
    }

    return result;
  });
};
