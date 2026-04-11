import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({ url: url!, authToken: authToken! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.schedule.updateMany({
    where: { endTime: "23:59" },
    data: { endTime: "05:59" },
  });
  console.log(`Updated ${result.count} schedules to span across midnight to 05:59.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
