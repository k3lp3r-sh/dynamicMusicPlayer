"use client";

import { useState, useEffect } from "react";

const TIME_SLOTS = [
  { name: "Morning Chill", emoji: "🌅", start: 6, end: 11 },
  { name: "Afternoon Energy", emoji: "⚡", start: 11, end: 16 },
  { name: "Evening Lounge", emoji: "🌆", start: 16, end: 21 },
  { name: "Late Night", emoji: "🌙", start: 21, end: 24 },
  { name: "Late Night", emoji: "🌙", start: 0, end: 6 },
];

export default function TimeIndicator() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const activeSlot = TIME_SLOTS.find((s) => hour >= s.start && hour < s.end);

  const timeString = mounted 
    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
      <div className="relative flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-glow-pulse" />
        <span className="text-sm font-medium text-text-primary tabular-nums">
          {timeString}
        </span>
      </div>
      {activeSlot && (
        <>
          <div className="w-px h-4 bg-border-light" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{activeSlot.emoji}</span>
            <span className="text-sm text-text-secondary font-medium">
              {activeSlot.name}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
