"use client";

import { useRef, useState, useEffect, useCallback, MouseEvent as ReactMouseEvent } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Drag state — isMouseDown tracks button press, isDragging only true after real movement
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDown = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const updateScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < maxScroll - 10);
    setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateScroll, 150);
    window.addEventListener("resize", updateScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScroll);
    };
  }, [playlists, updateScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // ── Drag handlers ──
  const handleMouseDown = (e: ReactMouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDown.current = true;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const delta = x - dragStartX.current;
    // Only activate drag mode after 5px of movement — allows clicks through
    if (!isDragging && Math.abs(delta) > 5) {
      setIsDragging(true);
    }
    if (Math.abs(delta) > 5) {
      e.preventDefault();
      scrollRef.current.scrollLeft = dragScrollLeft.current - delta * 1.4;
    }
  };

  if (!playlists || playlists.length === 0) return null;

  const activeCount = playlists.filter(p => p.isActive).length;

  return (
    <div className="mb-12 sm:mb-16 category-row relative">
      {/* ── Category Header ── */}
      <div className="flex items-center justify-between mb-5 px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-3">
            {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
            {category}
          </h2>
          {activeCount > 0 && (
            <span className="category-pill live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {activeCount} live
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border text-sm ${
              canScrollLeft
                ? "bg-surface-elevated/60 hover:bg-primary/90 border-border-light hover:border-primary text-text-primary hover:text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95"
                : "bg-surface/20 border-transparent text-text-muted/20 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border text-sm ${
              canScrollRight
                ? "bg-surface-elevated/60 hover:bg-primary/90 border-border-light hover:border-primary text-text-primary hover:text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95"
                : "bg-surface/20 border-transparent text-text-muted/20 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* ── Scroll Progress Track ── */}
      <div className="px-4 sm:px-8 mb-4">
        <div className="scroll-progress-track">
          <div
            className="scroll-progress-fill"
            style={{ width: `${Math.max(scrollProgress, 2)}%` }}
          />
        </div>
      </div>

      {/* ── Cards Container ── */}
      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={updateScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className={`flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-8 pb-8 pt-3 carousel-scroll mask-edges select-none ${
            isDragging ? "is-dragging" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {playlists.map((pl) => (
            <div key={pl.id} className="carousel-item">
              <PlaylistCard
                spotifyId={pl.spotifyId}
                name={pl.name}
                description={pl.description}
                isActive={pl.isActive}
              />
            </div>
          ))}
          <div className="w-[8vw] shrink-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
