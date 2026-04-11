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
  playlists: Playlist[];
  coverImage: string;
  isActiveCategory?: boolean;
}

export default function PlaylistCarousel({
  category,
  playlists,
  coverImage,
  isActiveCategory = false,
}: PlaylistCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

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
    if (!isDragging && Math.abs(delta) > 5) {
      setIsDragging(true);
    }
    if (Math.abs(delta) > 5) {
      e.preventDefault();
      scrollRef.current.scrollLeft = dragScrollLeft.current - delta * 1.4;
    }
  };

  if (!playlists || playlists.length === 0) return null;

  const activeCount = playlists.filter((p) => p.isActive).length;

  return (
    <div className={`mb-16 sm:mb-24 category-row ${isActiveCategory ? "py-8 relative rounded-3xl bg-accent/[0.06] dark:bg-accent/10 ring-1 ring-accent/30 shadow-[0_8px_40px_rgba(37,144,146,0.12)]" : ""}`}>
      {isActiveCategory && (
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent rounded-3xl pointer-events-none" />
      )}
      {/* Category Section */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Hero: Cover + Title */}
        <div className="flex items-end gap-6 sm:gap-10 mb-8">
          {/* Album Cover */}
          <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded overflow-hidden shrink-0 border ${isActiveCategory ? 'border-accent shadow-[0_8px_30px_rgba(37,144,146,0.25)]' : 'border-border'}`}>
            <img
              src={coverImage}
              alt={`${category} cover art`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title + Meta */}
          <div className="pb-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl sm:text-3xl font-display font-semibold tracking-tight text-text-primary">
                {category}
              </h2>
              {activeCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
                  <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                    {activeCount} live
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-muted">
              {playlists.length} playlists
            </p>
          </div>

          {/* Nav Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto pb-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 border text-sm ${
                canScrollLeft
                  ? "border-border text-text-secondary hover:border-accent hover:text-accent"
                  : "border-transparent text-text-muted/30 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 border text-sm ${
                canScrollRight
                  ? "border-border text-text-secondary hover:border-accent hover:text-accent"
                  : "border-transparent text-text-muted/30 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Scroll Progress */}
        <div className="mb-5">
          <div className="scroll-progress-track">
            <div
              className="scroll-progress-fill"
              style={{ width: `${Math.max(scrollProgress, 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        onScroll={updateScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 overflow-x-auto px-6 sm:px-10 lg:px-16 pb-4 carousel-scroll select-none ${
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
        <div className="w-[5vw] shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}
