"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import TimeIndicator from "./TimeIndicator";
import PlaylistCarousel from "./PlaylistCarousel";
import { Playlist, Schedule } from "@prisma/client";

type PlaylistWithSchedule = Playlist & { schedules?: Schedule[] };

interface PlayerPageProps {
  playlists: PlaylistWithSchedule[];
  siteTitle: string;
  siteTagline: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "Morning Chill": "🌅",
  "Afternoon Energy": "⚡",
  "Evening Lounge": "🌆",
  "Late Night": "🌙",
};

export default function PlayerPage({
  playlists,
  siteTitle,
  siteTagline,
}: PlayerPageProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [phase, setPhase] = useState<"splash" | "revealing" | "ready">("splash");

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);

    // Phase 1: Splash shows for 1.8s
    const t1 = setTimeout(() => setPhase("revealing"), 1800);
    // Phase 2: Fade-out takes 1s, then remove completely
    const t2 = setTimeout(() => setPhase("ready"), 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Active playlist logic
  const isPlaylistActive = (pl: PlaylistWithSchedule) => {
    if (!currentTime || !pl.schedules || pl.schedules.length === 0) return false;
    const day = currentTime.getDay();
    const hm = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;
    return pl.schedules.some((s) => {
      const isDay = s.dayOfWeek === 7 || s.dayOfWeek === day;
      if (s.startTime > s.endTime) return isDay && (hm >= s.startTime || hm <= s.endTime);
      return isDay && hm >= s.startTime && hm <= s.endTime;
    });
  };

  const groupedPlaylists = playlists.reduce((acc, pl) => {
    const cat = pl.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...pl, isActive: isPlaylistActive(pl) });
    return acc;
  }, {} as Record<string, any[]>);

  let activeCategory: string | null = null;
  for (const [cat, pls] of Object.entries(groupedPlaylists)) {
    if (pls.some((p) => p.isActive)) { activeCategory = cat; break; }
  }

  const categories = Object.keys(groupedPlaylists).sort((a, b) => {
    if (a === activeCategory) return -1;
    if (b === activeCategory) return 1;
    return a.localeCompare(b);
  });

  const isContentVisible = phase === "revealing" || phase === "ready";

  return (
    <div className="min-h-screen pb-24 font-body relative bg-background overflow-hidden bg-noise">
      {/* ── Splash Reveal ── */}
      {phase !== "ready" && (
        <div className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center ${phase === "revealing" ? "animate-splash-fade-out" : ""}`}>
          {/* Animated concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-splash-ring" style={{ animationDelay: "0s" }} />
            <div className="absolute w-32 h-32 rounded-full border border-primary/15 animate-splash-ring" style={{ animationDelay: "0.8s" }} />
            <div className="absolute w-32 h-32 rounded-full border border-primary/10 animate-splash-ring" style={{ animationDelay: "1.6s" }} />
          </div>

          {/* Logo */}
          <div className="animate-splash-breathe scale-[2.5] sm:scale-[3.5] mb-16 relative z-10">
            <Logo />
          </div>

          {/* Decorative line */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-splash-line mb-6" style={{ width: 0 }} />

          {/* Title */}
          <h1 className="text-lg sm:text-xl font-display font-light text-white tracking-[0.4em] uppercase animate-splash-text-in">
            {siteTitle}
          </h1>
        </div>
      )}

      {/* ── Floating Orbs (always visible, create depth) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="orb orb-primary w-[600px] h-[600px] top-[-15%] left-[-5%] animate-float" style={{ animationDelay: "0s" }} />
        <div className="orb orb-accent w-[400px] h-[400px] bottom-[10%] right-[-8%] animate-float" style={{ animationDelay: "2s", animationDuration: "10s" }} />
        <div className="orb orb-warm w-[350px] h-[350px] top-[40%] left-[60%] animate-float" style={{ animationDelay: "4s", animationDuration: "12s" }} />
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      </div>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-50 glass-strong shadow-2xl px-4 sm:px-8 py-3 transition-all duration-700 ${isContentVisible ? "animate-fade-up" : "opacity-0"}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/35 transition-all duration-700 opacity-0 group-hover:opacity-100" />
              <Logo />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-[0.15em] uppercase leading-tight">
                {siteTitle}
              </h1>
              <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-[0.25em] font-medium">
                {siteTagline}
              </p>
            </div>
          </div>
          <TimeIndicator />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className={`max-w-screen-2xl mx-auto pt-12 sm:pt-16 relative z-10 transition-all duration-700 ${isContentVisible ? "animate-fade-in" : "opacity-0"}`}>
        {/* Hero Section */}
        <div className="px-4 sm:px-8 max-w-7xl mx-auto mb-10 sm:mb-14">
          {currentTime && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-primary font-display uppercase tracking-[0.2em] text-xs font-semibold">
                {activeCategory ? "Now Playing" : "Current Selections"}
              </p>
            </div>
          )}
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-[0.9] mb-4">
            Curated
          </h2>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.9]">
            <span className="gradient-text italic">Experiences</span>
          </h2>

          <p className="mt-6 text-text-secondary text-sm sm:text-base max-w-lg leading-relaxed">
            Premium sound curation that transforms your space. Each playlist is hand-picked to match the perfectly right moment.
          </p>
        </div>

        {/* Playlist Categories */}
        {isContentVisible && currentTime ? (
          <div className="relative z-20">
            {categories.map((category) => (
              <PlaylistCarousel
                key={category}
                category={category}
                emoji={CATEGORY_EMOJIS[category] || ""}
                playlists={groupedPlaylists[category]}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-32">
            <div className="w-12 h-12 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className={`relative z-10 mt-12 border-t border-border px-4 sm:px-8 py-8 transition-all duration-700 ${isContentVisible ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: "0.5s" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs tracking-wider uppercase">
            &copy; {new Date().getFullYear()} {siteTitle}
          </p>
          <p className="text-text-muted/50 text-[10px] tracking-wider uppercase">
            Powered by Spotify
          </p>
        </div>
      </footer>
    </div>
  );
}
