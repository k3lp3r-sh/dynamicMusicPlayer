import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.LOCAL_DATABASE_URL || "file:./dev.db",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
