"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Asset } from "@/lib/assets";
import { TOOL_ICONS, icon3d } from "@/lib/library";
import Spotlight from "@/components/Spotlight";

type Tool = "image" | "video" | "audio" | "glaze" | "billboard" | "splice";
type NextStep = { tool: Tool; href: string; title: string; line: string };

function stepsFor(a: Asset): NextStep[] {
  if (a.kind === "image") {
    return [
      { tool: "video", href: `/video?src=${a.id}`, title: "Animate it", line: "Give it a camera move" },
      { tool: "glaze", href: `/glaze?src=${a.id}`, title: "Give it a look", line: "Film, noir, VHS and more" },
      { tool: "billboard", href: `/billboard?src=${a.id}`, title: "Make an ad", line: "Headline, button, three formats" },
      { tool: "splice", href: `/splice?add=${a.id}`, title: "Add to an edit", line: "Cut it with clips and sound" },
    ];
  }
  if (a.kind === "motion") {
    return [
      { tool: "splice", href: `/splice?add=${a.id}`, title: "Cut it into an edit", line: "Join it with other shots" },
      { tool: "audio", href: "/audio", title: "Score it", line: "Render a mood bed to go under it" },
    ];
  }
  return [{ tool: "splice", href: `/splice?track=${a.id}`, title: "Use it in an edit", line: "Lay it under your shots" }];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Animated "what next" cards shown under a finished result, linking it into the other studios. */
export default function NextSteps({ asset, from }: { asset: Asset; from: Tool }) {
  const steps = stepsFor(asset).filter((s) => s.tool !== from);
  if (!steps.length) return null;
  return (
    <motion.section
      key={asset.id}
      aria-label="Next step"
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="w-full"
    >
      <p className="eyebrow">Next step</p>
      <ul className={`mt-3 grid gap-3 ${steps.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {steps.map((s, i) => (
          <motion.li key={s.tool} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE }}>
            <Link href={s.href} className="group block h-full rounded-3xl">
              <Spotlight className="h-full">
                <img src={icon3d(TOOL_ICONS[s.tool])} alt="" className="h-10 w-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-6" />
                <p className="mt-6 flex items-center justify-between gap-2 font-medium tracking-tight">
                  {s.title}
                  <span className="arrow-dot text-xs transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>↗</span>
                </p>
                <p className="text-sm text-muted">{s.line}</p>
              </Spotlight>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
