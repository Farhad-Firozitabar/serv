import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance reused across the CafePOS server runtime.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasourceUrl: process.env.DATABASE_URL
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
