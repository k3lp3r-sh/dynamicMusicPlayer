import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL (or TURSO_DATABASE_URL). This project is configured to use the remote Turso database only."
  );
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
