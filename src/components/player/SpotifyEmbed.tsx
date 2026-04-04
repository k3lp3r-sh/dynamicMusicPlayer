"use client";

import { useState } from "react";

interface SpotifyEmbedProps {
  spotifyId: string;
  playlistName?: string;
  compact?: boolean;
}

export default function SpotifyEmbed({
  spotifyId,
  playlistName,
}: SpotifyEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const height = 352; // Always show the full playlist tracklist
  const playlistUrl = `https://open.spotify.com/playlist/${spotifyId}`;

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-lg">
        {!loaded && (
          <div
            className="absolute inset-0 animate-shimmer rounded-lg"
            style={{ height }}
          />
        )}
        <iframe
          src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`}
          title={`${playlistName || "Spotify playlist"} embed`}
          width="100%"
          height={height}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className={`rounded-lg transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
      </div>

      <a
        href={playlistUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-light hover:text-white transition-colors"
      >
        Open In Spotify
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
