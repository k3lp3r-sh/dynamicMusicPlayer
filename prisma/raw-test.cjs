const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
console.log("DB Path:", dbPath);
console.log("File exists:", require("fs").existsSync(dbPath));
console.log("File size:", require("fs").statSync(dbPath).size);

const db = new Database(dbPath);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables);
db.close();
