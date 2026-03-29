"use client";

import { useRef, useState, useEffect } from "react";
import PlaylistCard from "./PlaylistCard";

interface Playlist {
  id: string;
  spotifyId: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface PlaylistCarouselProps {
  category: string;
  emoji?: string;
  playlists: Playlist[];
}

export default function PlaylistCarousel({
  category,
  emoji,
  playlists,
}: PlaylistCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // We add a tiny buffer (10px) to prevent sub-pixel rounding issues marking it as incomplete
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    // Initial check and wait a tick for DOM to size correctly
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [playlists]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const clientWidth = scrollContainerRef.current.clientWidth;
      // Scroll by mostly full container width to snap elegantly
      const scrollAmount = clientWidth * 0.85;
      
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!playlists || playlists.length === 0) return null;

  return (
    <div className="mb-16 category-row relative">
      <div className="flex items-center justify-between mb-6 px-4 sm:px-8">
        <h2 className="text-3xl font-display font-medium tracking-tight text-white flex items-center gap-3">
          {emoji && <span className="text-3xl">{emoji}</span>}
          {category}
        </h2>
        
        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
              canScrollLeft 
                ? "bg-surface-elevated/50 hover:bg-primary border-border-light hover:border-primary text-text-primary hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transform hover:scale-110 active:scale-95" 
                : "bg-surface/30 border-transparent text-text-muted/30 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
              canScrollRight 
                ? "bg-surface-elevated/50 hover:bg-primary border-border-light hover:border-primary text-text-primary hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transform hover:scale-110 active:scale-95" 
                : "bg-surface/30 border-transparent text-text-muted/30 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-5 sm:gap-8 overflow-x-auto px-4 sm:px-8 pb-10 pt-4 carousel-scroll mask-edges"
        >
          {playlists.map((pl) => (
            <div key={pl.id} className="carousel-item">
              <PlaylistCard
                id={pl.id}
                spotifyId={pl.spotifyId}
                name={pl.name}
                description={pl.description}
                isActive={pl.isActive}
              />
            </div>
          ))}
          {/* Spacer block at the end so last item doesn't stick to edge */}
          <div className="w-[10vw] shrink-0 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
