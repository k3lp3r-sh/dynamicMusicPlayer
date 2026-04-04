import "server-only";

const SPOTIFY_PLAYLIST_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export class SpotifyPlaylistValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SpotifyPlaylistValidationError";
    this.status = status;
  }
}

export function normalizeSpotifyPlaylistId(value: unknown) {
  if (typeof value !== "string") {
    throw new SpotifyPlaylistValidationError("Spotify playlist ID is required.");
  }

  const trimmed = value.trim();
  const embeddedMatch = trimmed.match(/(?:playlist[/:])([A-Za-z0-9]{22})/);
  const spotifyId = embeddedMatch?.[1] ?? trimmed;

  if (!SPOTIFY_PLAYLIST_ID_PATTERN.test(spotifyId)) {
    throw new SpotifyPlaylistValidationError(
      "Use a valid Spotify playlist URL or 22-character playlist ID."
    );
  }

  return spotifyId;
}

export async function validateSpotifyPlaylistId(spotifyId: string) {
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(
      `https://open.spotify.com/playlist/${spotifyId}`
    )}`,
    {
      headers: {
        "user-agent": "Truffles Playlist Validation",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    }
  );

  if (response.status === 404) {
    throw new SpotifyPlaylistValidationError(
      "Spotify could not find that playlist. Use a public playlist URL or playlist ID."
    );
  }

  if (!response.ok) {
    throw new SpotifyPlaylistValidationError(
      "Spotify validation is temporarily unavailable. Please try again in a moment.",
      502
    );
  }

  const payload = (await response.json()) as {
    title?: string;
    iframe_url?: string;
    thumbnail_url?: string;
  };

  return {
    title: payload.title ?? null,
    iframeUrl: payload.iframe_url ?? null,
    thumbnailUrl: payload.thumbnail_url ?? null,
  };
}
