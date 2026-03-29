import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
console.log("DB Path:", dbPath);
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables:", result);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  await prisma.$disconnect();
}

main();
