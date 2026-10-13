"use client";

import type { CSSProperties, ReactNode } from "react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

const THEMED = {
  "--spotlight-card-surface": "var(--panel)",
  "--spotlight-card-border": "var(--line)",
  "--spotlight-card-shadow": "none",
} as CSSProperties;

/** React Bits SpotlightCard on Kiln's panel tokens with an accent glow that follows the cursor. */
export default function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <SpotlightCard className={`!p-5 ${className}`} spotlightColor="#2f6bff" intensity={0.35} borderGlow={0.9} style={THEMED}>
      {children}
    </SpotlightCard>
  );
}
