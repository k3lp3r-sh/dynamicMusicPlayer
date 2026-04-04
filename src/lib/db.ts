import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (or TURSO_DATABASE_URL). This app is configured to use the remote Turso database only."
    );
  }

  if (!authToken) {
    throw new Error(
      "Missing DATABASE_AUTH_TOKEN (or TURSO_AUTH_TOKEN) for the remote Turso database."
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
