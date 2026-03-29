"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <span className="text-xl font-bold text-white font-[var(--font-display)]">T</span>
      </div>
    </div>
  );
}
