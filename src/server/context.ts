import { PrismaClient } from "@prisma/client";

import { DATABASE_URL, DEV } from "./utils/constants";

const prisma = new PrismaClient({
  log: DEV ? ["query"] : undefined,
  datasources: {
    db: {
      url: `file:${DATABASE_URL}`,
    },
  },
});

export interface Context {
  prisma: PrismaClient;
}

export function context(): Context {
  return { prisma };
}