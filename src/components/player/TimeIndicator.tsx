"use client";

import { useState, useEffect } from "react";

const TIME_SLOTS = [
  { name: "Morning Chill", start: 6, end: 11 },
  { name: "Afternoon Energy", start: 11, end: 16 },
  { name: "Evening Lounge", start: 16, end: 21 },
  { name: "Late Night", start: 21, end: 24 },
  { name: "Late Night", start: 0, end: 6 },
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
    <div className="flex items-center gap-3 text-white/90">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
        <span className="text-xs font-body tabular-nums">
          {timeString}
        </span>
      </div>
      {activeSlot && (
        <>
          <span className="text-white/60">·</span>
          <span className="text-xs text-white/80 font-body">
            {activeSlot.name}
          </span>
        </>
      )}
    </div>
  );
}
