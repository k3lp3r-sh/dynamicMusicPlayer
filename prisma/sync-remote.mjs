import nextEnv from "@next/env";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function getRequiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);

  if (!value) {
    throw new Error(`Missing ${name}${fallbackName ? ` (or ${fallbackName})` : ""}.`);
  }

  return value;
}

function getSchemaStatements() {
  const migrationPath = path.join(
    process.cwd(),
    "prisma",
    "migrations",
    "20260329082022_init",
    "migration.sql"
  );
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  return migrationSql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) =>
      statement
        .replace('CREATE TABLE "', 'CREATE TABLE IF NOT EXISTS "')
        .replace('CREATE UNIQUE INDEX "', 'CREATE UNIQUE INDEX IF NOT EXISTS "')
    );
}

async function main() {
  const remoteUrl = getRequiredEnv("DATABASE_URL", "TURSO_DATABASE_URL");
  const remoteAuthToken = getRequiredEnv("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
  const localDbPath = path.join(process.cwd(), "dev.db");

  if (!fs.existsSync(localDbPath)) {
    throw new Error(`Local source database not found at ${localDbPath}`);
  }

  const localDb = new Database(localDbPath, { readonly: true });
  const remoteDb = createClient({ url: remoteUrl, authToken: remoteAuthToken });

  try {
    for (const statement of getSchemaStatements()) {
      await remoteDb.execute(statement);
    }

    const playlists = localDb
      .prepare(
        'SELECT "id", "spotifyId", "name", "description", "category", "createdAt" FROM "Playlist" ORDER BY "createdAt" ASC'
      )
      .all();
    const schedules = localDb
      .prepare(
        'SELECT "id", "playlistId", "dayOfWeek", "startTime", "endTime" FROM "Schedule" ORDER BY "startTime" ASC'
      )
      .all();
    const siteSettings = localDb
      .prepare('SELECT "key", "value" FROM "SiteSettings" ORDER BY "key" ASC')
      .all();

    await remoteDb.batch(
      [
        'DELETE FROM "Schedule"',
        'DELETE FROM "Playlist"',
        'DELETE FROM "SiteSettings"',
      ],
      "write"
    );

    await remoteDb.batch(
      [
        ...playlists.map((playlist) => ({
          sql:
            'INSERT INTO "Playlist" ("id", "spotifyId", "name", "description", "category", "createdAt") VALUES (?, ?, ?, ?, ?, ?)',
          args: [
            playlist.id,
            playlist.spotifyId,
            playlist.name,
            playlist.description,
            playlist.category,
            playlist.createdAt,
          ],
        })),
        ...schedules.map((schedule) => ({
          sql:
            'INSERT INTO "Schedule" ("id", "playlistId", "dayOfWeek", "startTime", "endTime") VALUES (?, ?, ?, ?, ?)',
          args: [
            schedule.id,
            schedule.playlistId,
            schedule.dayOfWeek,
            schedule.startTime,
            schedule.endTime,
          ],
        })),
        ...siteSettings.map((setting) => ({
          sql: 'INSERT INTO "SiteSettings" ("key", "value") VALUES (?, ?)',
          args: [setting.key, setting.value],
        })),
      ],
      "write"
    );

    const playlistCount = await remoteDb.execute('SELECT COUNT(*) AS count FROM "Playlist"');
    const scheduleCount = await remoteDb.execute('SELECT COUNT(*) AS count FROM "Schedule"');
    const settingsCount = await remoteDb.execute('SELECT COUNT(*) AS count FROM "SiteSettings"');

    console.log(
      JSON.stringify(
        {
          syncedFrom: localDbPath,
          remoteUrl,
          counts: {
            playlists: Number(playlistCount.rows[0]?.count ?? 0),
            schedules: Number(scheduleCount.rows[0]?.count ?? 0),
            siteSettings: Number(settingsCount.rows[0]?.count ?? 0),
          },
        },
        null,
        2
      )
    );
  } finally {
    localDb.close();
    await remoteDb.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
