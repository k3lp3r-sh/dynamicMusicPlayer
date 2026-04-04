import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseConfig() {
  const url =
    process.env.DATABASE_URL ||
    process.env.TURSO_DATABASE_URL ||
    (process.env.NODE_ENV === "production" ? undefined : "file:./dev.db");
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (or TURSO_DATABASE_URL) in production. Add it in your Vercel project settings before deploying."
    );
  }

  return { url, authToken };
}

function createPrismaClient() {
  const { url, authToken } = getDatabaseConfig();

  const adapter = new PrismaLibSql({ url, authToken });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
