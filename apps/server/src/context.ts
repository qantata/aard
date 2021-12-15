import { PrismaClient } from "../prisma/generated";

import { DATABASE_URL } from "./utils/constants";

const prisma = new PrismaClient({
  log: process.env.DEBUG !== undefined ? ["query"] : undefined,
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
