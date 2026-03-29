"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import TimeIndicator from "./TimeIndicator";
import PlaylistCarousel from "./PlaylistCarousel";
import { Playlist, Schedule } from "@prisma/client";

// Define a type that joins playlist and schedule cleanly
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

  // Use useEffect to set the time on the client side only to prevent hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine which playlists are currently active based on local time
  const isPlaylistActive = (pl: PlaylistWithSchedule) => {
    if (!currentTime || !pl.schedules || pl.schedules.length === 0) return false;
    
    const day = currentTime.getDay();
    const currentHourMinute = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;
    
    return pl.schedules.some((s) => {
      // 7 implies all days of week in our simplified schema
      const isCorrectDay = s.dayOfWeek === 7 || s.dayOfWeek === day;
      
      // Handle overnight schedules (e.g., 21:00 to 06:00)
      if (s.startTime > s.endTime) {
        return isCorrectDay && (currentHourMinute >= s.startTime || currentHourMinute <= s.endTime);
      }
      
      // Normal schedule (e.g., 06:00 to 11:00)
      return isCorrectDay && currentHourMinute >= s.startTime && currentHourMinute <= s.endTime;
    });
  };

  // Group by category and attach isActive flag
  const groupedPlaylists = playlists.reduce((acc, pl) => {
    const isActive = isPlaylistActive(pl);
    const cat = pl.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...pl, isActive });
    return acc;
  }, {} as Record<string, any[]>);

  // Determine active category to show it first
  let activeCategory: string | null = null;
  for (const [cat, pls] of Object.entries(groupedPlaylists)) {
    if (pls.some((p) => p.isActive)) {
      activeCategory = cat;
      break;
    }
  }

  // Define category render order
  const categories = Object.keys(groupedPlaylists).sort((a, b) => {
    if (a === activeCategory) return -1;
    if (b === activeCategory) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen pb-24 font-body relative bg-background overflow-hidden">
      {/* Immersive background layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[70vh] bg-gradient-radial from-primary/10 via-background to-background animate-glow-pulse origin-center"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60vh] bg-gradient-radial from-accent/5 via-background to-background pointer-events-none opacity-60"></div>
        <div className="absolute inset-0 bg-grid opacity-[0.25]"></div>
        {/* Subtle noise overlay could go here if an image was provided */}
      </div>

      {/* Header logic */}
      <header className="sticky top-0 z-50 glass-strong border-b-border/40 shadow-2xl px-4 sm:px-8 py-4 animate-fade-up">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl group-hover:bg-primary/60 transition-all duration-500 opacity-50"></div>
              <Logo />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-widest uppercase mb-1 drop-shadow-sm">
                {siteTitle}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary uppercase tracking-[0.2em] font-medium opacity-80 mix-blend-screen">
                {siteTagline}
              </p>
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-2xl hover:bg-surface-elevated transition-colors duration-300">
            <TimeIndicator />
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto pt-16 relative z-10 animate-fade-in">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto mb-12">
          {currentTime && (
            <p className="text-primary font-display uppercase tracking-widest text-sm font-semibold mb-2 animate-fade-in blur-0">
              {activeCategory ? "Now Playing" : "Current Selections"}
            </p>
          )}
          <h2 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-none mb-6">
            Curated <br/>
            <span className="gradient-text italic opacity-90">Experiences</span>
          </h2>
        </div>

        {currentTime ? (
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
          <div className="flex justify-center py-32 scale-150 animate-pulse">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
      </main>
    </div>
  );
}
