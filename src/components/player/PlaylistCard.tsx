"use client";

import { useState, useRef, MouseEvent } from "react";
import SpotifyEmbed from "./SpotifyEmbed";

interface PlaylistCardProps {
  id: string;
  spotifyId: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function PlaylistCard({
  id,
  spotifyId,
  name,
  description,
  isActive,
}: PlaylistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Track mouse position for the radial shine effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`glass-card card-shine rounded-2xl overflow-hidden transition-all duration-400 transform w-[280px] sm:w-[340px] shrink-0 border group/card ${
        isActive
          ? "glow-active border-primary/30 -translate-y-1.5 shadow-2xl"
          : "border-border-light hover:border-border-glow hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(124,58,237,0.12)]"
      }`}
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full transition-all duration-500 ${
        isActive
          ? "bg-gradient-to-r from-primary via-primary-light to-accent"
          : "bg-gradient-to-r from-transparent via-border-light to-transparent group-hover/card:via-primary/40"
      }`} />

      <div
        className="p-5 cursor-pointer relative z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-3 gap-3">
          <h3 className="font-display font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 text-white/95 group-hover/card:text-white transition-colors">
            {name}
          </h3>
          {isActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/15 rounded-full border border-primary/25 shrink-0 live-badge">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[9px] font-bold text-primary-light uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        <p className="text-[13px] text-text-secondary/80 line-clamp-2 min-h-[36px] leading-relaxed">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
            isExpanded ? "text-primary" : "text-text-muted group-hover/card:text-primary-light"
          }`}>
            {isExpanded ? "Hide Player" : "Listen Now"}
          </span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-400 border ${
            isExpanded
              ? "rotate-180 bg-primary/15 border-primary/30 text-primary"
              : "bg-surface/60 border-border-light group-hover/card:bg-surface-elevated group-hover/card:border-primary/25 group-hover/card:text-primary-light text-text-muted"
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable embed */}
      <div className={`grid-transition-wrapper ${isExpanded ? "grid-expanded" : "grid-collapsed"}`}>
        <div className="grid-transition-content">
          <div className="px-5 pb-5 pt-1 relative z-0">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent mb-4" />
            <SpotifyEmbed spotifyId={spotifyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
