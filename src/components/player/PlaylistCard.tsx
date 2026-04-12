"use client";

import { MouseEvent } from "react";

interface PlaylistCardProps {
  spotifyId: string;
  name: string;
  description: string;
  isActive: boolean;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export default function PlaylistCard({
  spotifyId,
  name,
  description,
  isActive,
  onPlay,
  isPlaying,
}: PlaylistCardProps) {
  return (
    <div
      style={{ boxShadow: "var(--card-shadow)" }}
      className={`rounded border overflow-hidden transition-all duration-300 w-[260px] sm:w-[300px] shrink-0 group ${
        isPlaying
          ? "border-accent bg-surface-elevated ring-1 ring-accent/30"
          : isActive
          ? "border-accent/40 bg-surface-elevated"
          : "border-border bg-surface hover:border-accent/20 hover:bg-surface-elevated"
      }`}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer relative"
        onClick={onPlay}
      >
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="font-display font-medium text-[14px] sm:text-[15px] leading-snug text-text-primary line-clamp-2 pr-4">
            {name}
          </h3>
          {isActive && !isPlaying && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                Live
              </span>
            </div>
          )}
          {isPlaying && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex gap-0.5 items-end h-2">
                <div className="w-0.5 h-2 bg-accent animate-[live-pulse_1s_ease-in-out_infinite]" />
                <div className="w-0.5 h-1.5 bg-accent animate-[live-pulse_1s_ease-in-out_infinite_0.2s]" />
                <div className="w-0.5 h-2.5 bg-accent animate-[live-pulse_1s_ease-in-out_infinite_0.4s]" />
              </div>
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                Playing
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
              isPlaying ? "text-accent" : "text-text-muted group-hover:text-accent"
            }`}
          >
            {isPlaying ? "Now Playing" : "Listen"}
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying
                ? "bg-accent text-white shadow-[0_0_15px_rgba(37,144,146,0.3)]"
                : "bg-surface text-text-primary border border-border group-hover:bg-accent group-hover:text-white group-hover:border-accent"
            }`}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
