import nextEnv from "@next/env";
import { createClient } from "@libsql/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function getRequiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);

  if (!value) {
    throw new Error(`Missing ${name}${fallbackName ? ` (or ${fallbackName})` : ""}.`);
  }

  return value;
}

async function validatePlaylist(spotifyId) {
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/playlist/${spotifyId}`)}`,
    {
      headers: {
        "user-agent": "Truffles Playlist Audit",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      valid: false,
      status: response.status,
      title: null,
    };
  }

  const payload = await response.json();

  return {
    valid: true,
    status: response.status,
    title: payload.title ?? null,
  };
}

async function main() {
  const url = getRequiredEnv("DATABASE_URL", "TURSO_DATABASE_URL");
  const authToken = getRequiredEnv("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
  const db = createClient({ url, authToken });

  try {
    const result = await db.execute(
      'SELECT "id", "name", "spotifyId", "category" FROM "Playlist" ORDER BY "category" ASC, "name" ASC'
    );

    const playlists = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      spotifyId: String(row.spotifyId),
      category: String(row.category),
    }));

    const report = [];

    for (const playlist of playlists) {
      const validation = await validatePlaylist(playlist.spotifyId);
      report.push({
        ...playlist,
        ...validation,
      });
    }

    const invalid = report.filter((playlist) => !playlist.valid);

    console.log(JSON.stringify({ total: report.length, invalid }, null, 2));
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
