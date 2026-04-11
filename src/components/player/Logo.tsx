"use client";

import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Truffles Logo"
        width={420}
        height={120}
        className="object-contain h-6 w-auto brightness-0 invert"
        priority
      />
    </div>
  );
}
