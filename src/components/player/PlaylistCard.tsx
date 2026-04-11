"use client";

import { useState, useRef, MouseEvent } from "react";
import SpotifyEmbed from "./SpotifyEmbed";

interface PlaylistCardProps {
  spotifyId: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function PlaylistCard({
  spotifyId,
  name,
  description,
  isActive,
}: PlaylistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{ boxShadow: "var(--card-shadow)" }}
      className={`rounded border overflow-hidden transition-all duration-300 w-[260px] sm:w-[300px] shrink-0 ${
        isActive
          ? "border-accent/40 bg-surface-elevated"
          : "border-border bg-surface hover:border-accent/20 hover:bg-surface-elevated"
      }`}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="font-display font-medium text-[14px] sm:text-[15px] leading-snug text-text-primary line-clamp-2">
            {name}
          </h3>
          {isActive && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                Live
              </span>
            </div>
          )}
        </div>

        <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed min-h-[32px]">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.1em] transition-colors duration-200 ${
              isExpanded ? "text-accent" : "text-text-muted hover:text-accent"
            }`}
          >
            {isExpanded ? "Hide" : "Listen"}
          </span>
          <div
            className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-300 ${
              isExpanded
                ? "rotate-180 text-accent"
                : "text-text-muted"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable embed */}
      <div className={`grid-transition-wrapper ${isExpanded ? "grid-expanded" : "grid-collapsed"}`}>
        <div className="grid-transition-content">
          <div className="px-5 pb-5">
            <div className="w-full h-px bg-border mb-4" />
            <SpotifyEmbed spotifyId={spotifyId} playlistName={name} />
          </div>
        </div>
      </div>
    </div>
  );
}
