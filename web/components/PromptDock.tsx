"use client";

import { RefObject, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { ASPECTS, AspectId } from "@/lib/image";

type Props = {
  prompt: string;
  setPrompt: (p: string) => void;
  aspect: AspectId;
  setAspect: (a: AspectId) => void;
  count: number;
  setCount: (fn: (c: number) => number) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabledReason?: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
};

const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

/** Floating prompt composer. Drag it by the grip, or collapse it to a pill and expand it again. */
export default function PromptDock(p: Props) {
  const bounds = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const [compact, setCompact] = useState(false);
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = p.inputRef ?? ownRef;

  const expand = () => {
    setCompact(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={bounds} className="pointer-events-none fixed inset-x-2 bottom-2 top-20 z-20 flex items-end justify-center">
      <motion.div
        layout
        drag
        dragControls={controls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={bounds}
        dragElastic={0.05}
        transition={SPRING}
        className={`pointer-events-auto mb-2 rounded-3xl bg-panel/95 shadow-2xl ring-1 ring-line backdrop-blur transition-shadow focus-within:ring-ember/50 ${compact ? "w-auto" : "w-full max-w-3xl"}`}
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          <button
            type="button"
            aria-label="Drag to move the prompt box"
            title="Drag to move"
            onPointerDown={(e) => controls.start(e)}
            className="grid h-6 w-10 cursor-grab touch-none place-items-center rounded-full text-muted hover:bg-panel-2 active:cursor-grabbing"
          >
            <svg aria-hidden viewBox="0 0 20 8" className="h-2 w-5" fill="currentColor">
              {[2, 8, 14].flatMap((x) => [<circle key={`${x}a`} cx={x + 2} cy="2" r="1.4" />, <circle key={`${x}b`} cx={x + 2} cy="6" r="1.4" />])}
            </svg>
          </button>
          {compact && (
            <button type="button" onClick={expand} className="max-w-[46vw] truncate px-1 text-sm text-muted hover:text-fg sm:max-w-xs">
              {p.prompt.trim() || "Describe a scene…"}
            </button>
          )}
          <button
            type="button"
            onClick={() => (compact ? expand() : setCompact(true))}
            aria-label={compact ? "Expand the prompt box" : "Collapse the prompt box"}
            aria-expanded={!compact}
            className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-panel-2 hover:text-fg"
          >
            <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${compact ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 4.5 6 7.5 9 4.5" />
            </svg>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!compact && (
            <motion.form
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={(e) => { e.preventDefault(); p.onSubmit(); }}
              className="overflow-hidden px-3 pb-3"
            >
              <label htmlFor="prompt" className="sr-only">Prompt</label>
              <textarea
                id="prompt"
                ref={inputRef}
                value={p.prompt}
                onChange={(e) => p.setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); p.onSubmit(); } }}
                rows={2}
                maxLength={1000}
                placeholder="Describe the scene you want to fire up…"
                className="w-full resize-none bg-transparent px-2 py-1 text-base outline-none placeholder:text-muted/70"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div role="radiogroup" aria-label="Aspect ratio" className="flex rounded-full bg-panel-2 p-1">
                  {ASPECTS.map((a) => (
                    <button key={a.id} type="button" role="radio" aria-checked={p.aspect === a.id} onClick={() => p.setAspect(a.id)}
                      className={`rounded-full px-2.5 py-1 text-xs tabular-nums ${p.aspect === a.id ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>
                      {a.id}
                    </button>
                  ))}
                </div>
                <div className="flex items-center rounded-full bg-panel-2 px-1" aria-label="Number of images">
                  <button type="button" aria-label="Fewer images" disabled={p.count <= 1} onClick={() => p.setCount((c) => c - 1)} className="px-2 py-1 text-muted disabled:opacity-30">−</button>
                  <span className="w-8 text-center text-xs tabular-nums" aria-live="polite">{p.count}/4</span>
                  <button type="button" aria-label="More images" disabled={p.count >= 4} onClick={() => p.setCount((c) => c + 1)} className="px-2 py-1 text-muted disabled:opacity-30">+</button>
                </div>
                <span className="hidden text-xs text-muted sm:inline">FLUX.1 schnell · free tier</span>
                <button type="submit" disabled={!p.canSubmit} title={p.disabledReason}
                  className="btn-ember ml-auto rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40">
                  Generate <span className="ml-1 hidden text-xs font-normal opacity-70 sm:inline">⌘↵</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
