"use client";

import { useState } from "react";

interface SpotifyEmbedProps {
  spotifyId: string;
  compact?: boolean;
}

export default function SpotifyEmbed({
  spotifyId,
}: SpotifyEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const height = 352; // Always show the full playlist tracklist

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {!loaded && (
        <div
          className="absolute inset-0 animate-shimmer rounded-lg"
          style={{ height }}
        />
      )}
      <iframe
        src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className={`rounded-lg transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
