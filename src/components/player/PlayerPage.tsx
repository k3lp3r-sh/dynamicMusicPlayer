"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import TimeIndicator from "./TimeIndicator";
import PlaylistCarousel from "./PlaylistCarousel";
import ThemeToggle from "./ThemeToggle";
import GlobalPlayer from "./GlobalPlayer";
import { Playlist, Schedule } from "@prisma/client";

type PlaylistWithSchedule = Playlist & { schedules?: Schedule[] };

interface PlayerPageProps {
  playlists: PlaylistWithSchedule[];
  siteTitle: string;
  siteTagline: string;
}

const CATEGORY_COVERS: Record<string, string> = {
  "Morning Chill": "/covers/morning-chill.png",
  "Afternoon Energy": "/covers/afternoon-energy.png",
  "Evening Lounge": "/covers/evening-lounge.png",
  "Late Night": "/covers/late-night.png",
};

export default function PlayerPage({
  playlists,
  siteTitle,
  siteTagline,
}: PlayerPageProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
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

  const UNLOCKED_IDS = [
    "37i9dQZF1DWT3gM3xdPT0c", // Morning Acoustic
    "37i9dQZF1DWUa8ZRTfalHk", // Pop Rising
    "37i9dQZF1DWTwnEm1IYyoj", // Soft Pop Hits
    "37i9dQZF1DXbcP8BbYEQaO", // Night Pop
  ];

  Object.values(groupedPlaylists).forEach((pls) => {
    pls.sort((a, b) => {
      const aUnlocked = UNLOCKED_IDS.includes(a.spotifyId) ? 1 : 0;
      const bUnlocked = UNLOCKED_IDS.includes(b.spotifyId) ? 1 : 0;
      return bUnlocked - aUnlocked; // Prioritize unlocked
    });
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handlePlayRequest = (id: string) => {
    if (UNLOCKED_IDS.includes(id)) {
      setActivePlaylistId(id);
    } else {
      setPaywallOpen(true);
    }
  };

  const categories = Object.keys(groupedPlaylists).sort((a, b) => {
    if (a === activeCategory) return -1;
    if (b === activeCategory) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className={`min-h-screen font-body relative transition-[padding] duration-500 flex flex-col ${activePlaylistId ? "pb-[180px]" : "pb-20"}`}>
      {/* ── Header ── */}
      <header className={`sticky top-0 z-50 bg-accent text-white backdrop-blur-sm shadow-sm px-6 sm:px-10 lg:px-16 py-4 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Logo />
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <p className="hidden sm:block text-[11px] text-white/80 tracking-[0.1em] uppercase">
              {siteTagline}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <TimeIndicator />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={`max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 sm:pt-24 pb-16 sm:pb-20 transition-all duration-700 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <div className="max-w-2xl">
          {currentTime && activeCategory && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
              <span className="text-[11px] font-medium text-accent uppercase tracking-[0.15em]">
                Now Playing · {activeCategory}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight leading-[1.05] text-text-primary mb-6">
            A premium auditory experience<br />
            <span className="text-text-muted font-light">for your space</span>
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md">
            Hand-picked playlists that transform your environment. 
            Each selection is crafted for the perfect moment.
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 mb-16 sm:mb-20">
        <div className="h-px bg-border" />
      </div>

      {/* ── Playlist Categories ── */}
      <main className={`relative z-10 transition-all duration-700 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        {mounted && currentTime ? (
          categories.map((category) => (
            <PlaylistCarousel
              key={category}
              category={category}
              playlists={groupedPlaylists[category]}
              coverImage={CATEGORY_COVERS[category] || "/covers/morning-chill.png"}
              isActiveCategory={category === activeCategory}
              onPlay={handlePlayRequest}
              activePlaylistId={activePlaylistId}
            />
          ))
        ) : (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border border-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className={`relative z-10 border-t border-border px-6 sm:px-10 lg:px-16 py-8 mt-8 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-text-muted text-[11px] tracking-[0.1em] uppercase">
            &copy; {new Date().getFullYear()} {siteTitle}
          </p>
          <p className="text-text-muted/40 text-[10px] tracking-[0.1em] uppercase">
            Powered by Spotify
          </p>
        </div>
      </footer>

      {/* ── Global Player ── */}
      <GlobalPlayer
        spotifyId={activePlaylistId}
        playlistName={playlists.find((p) => p.spotifyId === activePlaylistId)?.name || "Unknown Playlist"}
        coverImage={
          playlists.find((p) => p.spotifyId === activePlaylistId)
            ? CATEGORY_COVERS[playlists.find((p) => p.spotifyId === activePlaylistId)!.category] ||
              "/covers/morning-chill.png"
            : ""
        }
        onClose={() => setActivePlaylistId(null)}
      />

      {/* ── Paywall Modal ── */}
      {paywallOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[2rem] max-w-sm w-full p-8 text-center shadow-[0_20px_60px_-15px_rgba(44,38,32,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-[var(--surface)] flex items-center border border-[var(--border)] justify-center mx-auto mb-5 text-[var(--text-secondary)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 className="font-display font-medium text-lg text-[var(--text-primary)] mb-2">Premium Access Required</h3>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
              This playlist is not a part of the current contract. Please contact the administrator for more details.
            </p>
            <button
              onClick={() => setPaywallOpen(false)}
              className="w-full py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white rounded-xl font-medium transition-colors active:scale-[0.98]"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
