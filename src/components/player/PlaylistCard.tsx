"use client";

import { useState } from "react";
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

  return (
    <div
      className={`glass rounded-2xl overflow-hidden transition-all duration-300 transform w-[280px] sm:w-[340px] shrink-0 border border-border-light ${
        isActive 
          ? "glow-active border-primary/40 -translate-y-1" 
          : "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 hover:bg-surface-elevated/80"
      }`}
    >
      <div 
        className="p-5 cursor-pointer relative z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2">
            {name}
          </h3>
          {isActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-text-secondary line-clamp-2 min-h-[40px] leading-relaxed">
          {description}
        </p>
        
        <div className="mt-5 flex items-center justify-between group">
          <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
            isExpanded ? "text-primary" : "text-text-muted group-hover:text-primary"
          }`}>
            {isExpanded ? "Hide Player" : "Show Player"}
          </span>
          <div className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center transition-all duration-300 border border-border-light ${
            isExpanded ? "rotate-180 bg-primary/20 border-primary/30 text-primary" : "group-hover:bg-surface-elevated group-hover:border-primary/30 group-hover:text-primary"
          }`}>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* CSS-Grid based perfectly smooth expanding transition */}
      <div className={`grid-transition-wrapper ${isExpanded ? 'grid-expanded' : 'grid-collapsed'}`}>
        <div className="grid-transition-content">
          <div className="px-5 pb-5 pt-2 relative z-0">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border-light to-transparent mb-4"></div>
            {/* The Spotify embed loads within this container */}
          <SpotifyEmbed spotifyId={spotifyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
