"use client";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
        {/* Inner shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        <span className="text-lg font-bold text-white font-[var(--font-display)] relative z-10 drop-shadow-sm">T</span>
      </div>
    </div>
  );
}
