import nextEnv from "@next/env";
import { createClient } from "@libsql/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const REPLACEMENTS = [
  { name: "Morning Acoustic", spotifyId: "37i9dQZF1DWT3gM3xdPT0c" },
  { name: "Wake Up Happy", spotifyId: "37i9dQZF1DXdPec7aLTmlC" },
  { name: "Chill Tracks", spotifyId: "37i9dQZF1DX6VdMW310YC7" },
  { name: "Bossa Nova Cover", spotifyId: "37i9dQZF1DXardnHdSkglX" },
  { name: "Pop Rising", spotifyId: "37i9dQZF1DWUa8ZRTfalHk" },
  { name: "Rock Classics", spotifyId: "37i9dQZF1DWXRqgorJj26U" },
  { name: "Hits Don't Lie", spotifyId: "37i9dQZF1DX2M1RktxUUHG" },
  { name: "Lounge Soft", spotifyId: "37i9dQZF1DX82pCGH5USnM" },
  { name: "Night Rider", spotifyId: "07sBqhvbz1m6XnoBKuBcmJ" },
  { name: "Night Pop", spotifyId: "37i9dQZF1DXbcP8BbYEQaO" },
  { name: "Rock Ballads", spotifyId: "37i9dQZF1DWXs1L3AC0Xio" },
  { name: "Dark Academia", spotifyId: "37i9dQZF1DX17GkScaAekA" },
];

function getRequiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);

  if (!value) {
    throw new Error(`Missing ${name}${fallbackName ? ` (or ${fallbackName})` : ""}.`);
  }

  return value;
}

async function validateSpotifyId(spotifyId) {
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/playlist/${spotifyId}`)}`,
    {
      headers: {
        "user-agent": "Truffles Playlist Repair",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Replacement playlist ${spotifyId} failed validation with status ${response.status}.`);
  }

  const payload = await response.json();

  return payload.title ?? null;
}

async function main() {
  const url = getRequiredEnv("DATABASE_URL", "TURSO_DATABASE_URL");
  const authToken = getRequiredEnv("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
  const db = createClient({ url, authToken });

  try {
    const verifiedReplacements = [];

    for (const replacement of REPLACEMENTS) {
      const title = await validateSpotifyId(replacement.spotifyId);
      verifiedReplacements.push({
        ...replacement,
        verifiedTitle: title,
      });
    }

    for (const replacement of verifiedReplacements) {
      await db.execute({
        sql: 'UPDATE "Playlist" SET "spotifyId" = ? WHERE "name" = ?',
        args: [replacement.spotifyId, replacement.name],
      });
    }

    console.log(JSON.stringify(verifiedReplacements, null, 2));
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
