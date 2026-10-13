"use client";

import ToolHeader from "@/components/ToolHeader";
import NextSteps from "@/components/NextSteps";
import { useCallback, useEffect, useRef, useState } from "react";
import { Asset, LABEL_TEXT, downloadBlob, listAssets, saveAsset } from "@/lib/assets";
import { loadImage } from "@/lib/image";
import { MotionAspect, OUTPUT_SIZES, PRESETS, Preset, canRecord, drawFrame, renderMotion } from "@/lib/motion";
import { useObjectUrl } from "@/components/useObjectUrl";
import SourcePicker, { Step } from "@/components/SourcePicker";
import { SAMPLES, icon3d, libraryUrl } from "@/lib/library";

const DURATIONS = [3, 5, 8];

export default function VideoPage() {
  const [clips, setClips] = useState<Asset[]>([]);
  const [source, setSource] = useState<Asset>();
  const [img, setImg] = useState<HTMLImageElement>();
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [aspect, setAspect] = useState<MotionAspect>("9:16");
  const [duration, setDuration] = useState(5);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Asset>();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listAssets("motion").then(setClips);
  }, []);

  useEffect(() => {
    if (!source) return;
    let alive = true;
    loadImage(source.blob).then((i) => alive && setImg(i)).catch(() => setError("Couldn't read that image."));
    return () => { alive = false; };
  }, [source]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key.toLowerCase() === "p") setCatalogOpen(true);
      if (e.key === "Escape") setCatalogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const render = async () => {
    if (!img || !source) return;
    setError(undefined);
    setResult(undefined);
    setProgress(0);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const blob = await renderMotion(img, preset, aspect, duration, setProgress, ctrl.signal);
      const [width, height] = OUTPUT_SIZES[aspect];
      const clip: Asset = { id: crypto.randomUUID(), kind: "motion", label: "local-render", createdAt: Date.now(), blob, width, height, presetId: preset.id, durationS: duration, sourceId: source.id, prompt: source.prompt };
      await saveAsset(clip);
      setClips((c) => [clip, ...c]);
      setResult(clip);
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "Render failed.");
    } finally {
      setProgress(null);
    }
  };

  const recordable = typeof window === "undefined" || canRecord();
  const rendering = progress !== null;

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
      <p className="sr-only" aria-live="polite">{rendering ? "Rendering clip" : result ? "Clip ready" : ""}</p>

      <aside className="flex flex-col gap-4 rounded-3xl bg-panel p-4 lg:sticky lg:top-20 lg:self-start">
        <ToolHeader tool="video" eyebrow="Core" title="Video" line="Give any still a camera move." />
        <Step n={1} title="Source image">
          <SourcePicker value={source} onChange={(a) => { setSource(a); setResult(undefined); setError(undefined); }} />
        </Step>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">2 · Camera move</h2>
          <button onClick={() => setCatalogOpen(true)} className="flex w-full items-center justify-between rounded-xl bg-panel-2 px-3 py-2.5 text-left">
            <span><span className="block font-medium">{preset.name}</span><span className="text-xs text-muted">{preset.hint}</span></span>
            <kbd className="rounded border border-line px-1.5 text-[11px] text-muted">P</kbd>
          </button>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Seg label="Aspect" options={Object.keys(OUTPUT_SIZES) as MotionAspect[]} value={aspect} onChange={(v) => { setAspect(v); setResult(undefined); }} />
          <Seg label="Length" options={DURATIONS} value={duration} onChange={(v) => { setDuration(v); setResult(undefined); }} fmt={(d) => `${d}s`} />
        </section>

        {rendering ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Render progress">
              <div className="btn-ember h-full transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
            <button onClick={() => abortRef.current?.abort()} className="mt-2 w-full rounded-full bg-panel-2 py-2 font-mono text-xs uppercase tracking-[0.12em]">Cancel</button>
          </div>
        ) : (
          <button onClick={render} disabled={!img || !recordable} className="btn-ember rounded-full py-3 font-semibold disabled:opacity-40">
            Render clip
          </button>
        )}
        <p className="text-[11px] leading-relaxed text-muted">
          Rendered on your device with a scripted camera move. This is not AI video generation.
        </p>
        {!recordable && <p className="text-sm text-danger">This browser can&apos;t record video. Try Chrome, Edge or Firefox.</p>}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </aside>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-center rounded-3xl bg-panel p-4" style={{ minHeight: 360 }}>
          {result ? (
            <ClipPlayer asset={result} large />
          ) : img ? (
            <LivePreview img={img} preset={preset} aspect={aspect} duration={duration} />
          ) : (
            <div className="flex max-w-xs flex-col items-center text-center">
              <img src={icon3d("clapper")} alt="" className="mb-3 h-16 w-16" />
              <p className="text-lg font-medium">Pick an image to animate</p>
              <p className="mt-1 text-sm text-muted">Choose one of your generations, upload a photo, or paste from your clipboard.</p>
            </div>
          )}
        </div>

        {result && <NextSteps asset={result} from="video" />}

        {clips.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted">Your clips</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {clips.map((c) => <li key={c.id}><ClipPlayer asset={c} /></li>)}
            </ul>
          </div>
        )}
      </section>

      {catalogOpen && (
        <div role="dialog" aria-modal="true" aria-label="Camera moves" className="fixed inset-0 z-40 overflow-y-auto bg-bg/95 p-4 backdrop-blur" onClick={() => setCatalogOpen(false)}>
          <div className="mx-auto max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl">Camera moves</h2>
              <button onClick={() => setCatalogOpen(false)} aria-label="Close" className="rounded-full bg-panel-2 px-3 py-1.5 text-sm">Close · Esc</button>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESETS.map((p) => (
                <li key={p.id}>
                  <button
                    autoFocus={p.id === preset.id}
                    onClick={() => { setPreset(p); setResult(undefined); setCatalogOpen(false); }}
                    className={`w-full overflow-hidden rounded-2xl border text-left ${p.id === preset.id ? "border-fg" : "border-line hover:border-muted"}`}
                  >
                    <PresetTile img={img} preset={p} />
                    <span className="block bg-panel px-3 py-2">
                      <span className="block font-display text-lg">{p.name}</span>
                      <span className="text-xs text-muted">{p.hint}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Seg<T extends string | number>({ label, options, value, onChange, fmt = String }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <div className="flex rounded-lg bg-panel-2 p-0.5">
        {options.map((o) => (
          <button key={o} role="radio" aria-checked={o === value} onClick={() => onChange(o)}
            className={`flex-1 rounded-md py-1 text-xs tabular-nums ${o === value ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>
            {fmt(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function useLoop(draw: (t: number) => void, periodMs: number) {
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) { draw(0.5); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { draw(((now - start) % periodMs) / periodMs); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [draw, periodMs]);
}

function LivePreview({ img, preset, aspect, duration }: { img: HTMLImageElement; preset: Preset; aspect: MotionAspect; duration: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [W, H] = OUTPUT_SIZES[aspect];
  const draw = useCallback((t: number) => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) drawFrame(ctx, img, preset, t);
  }, [img, preset]);
  useLoop(draw, duration * 1000);
  return (
    <figure className="flex flex-col items-center gap-2">
      <canvas ref={ref} width={W / 2} height={H / 2} className="max-h-[60vh] w-auto max-w-full rounded-xl" aria-label={`Preview: ${preset.name}`} />
      <figcaption className="text-xs text-muted">Live preview · {preset.name} · {duration}s</figcaption>
    </figure>
  );
}

function PresetTile({ img, preset }: { img?: HTMLImageElement; preset: Preset }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sample = useSamplePhoto();
  const draw = useCallback((t: number) => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) drawFrame(ctx, img ?? sample ?? fallbackImage(), preset, t);
  }, [img, sample, preset]);
  useLoop(draw, 2500);
  return <canvas ref={ref} width={320} height={240} className="block aspect-[4/3] w-full bg-black" aria-hidden />;
}

/** A library photo for preset previews when no image is picked (cross-origin safe: CDN sends CORS). */
let samplePhoto: Promise<HTMLImageElement> | undefined;
function useSamplePhoto() {
  const [img, setImg] = useState<HTMLImageElement>();
  useEffect(() => {
    samplePhoto ??= new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = libraryUrl(SAMPLES[0]);
    });
    let alive = true;
    samplePhoto.then((i) => alive && setImg(i)).catch(() => {});
    return () => { alive = false; };
  }, []);
  return img;
}

/** Abstract test card used while the sample photo loads. */
let fallback: HTMLCanvasElement | undefined;
function fallbackImage() {
  if (fallback) return fallback;
  const cv = document.createElement("canvas");
  cv.width = 640;
  cv.height = 480;
  const g = cv.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, "#2a1408");
  grad.addColorStop(1, "#ff6a3d");
  g.fillStyle = grad;
  g.fillRect(0, 0, 640, 480);
  g.strokeStyle = "rgba(255,255,255,0.18)";
  for (let x = 0; x <= 640; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 480); g.stroke(); }
  for (let y = 0; y <= 480; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
  g.fillStyle = "#ffb547";
  g.beginPath();
  g.arc(320, 240, 70, 0, Math.PI * 2);
  g.fill();
  return (fallback = cv);
}

function ClipPlayer({ asset, large }: { asset: Asset; large?: boolean }) {
  const url = useObjectUrl(asset.blob);
  const preset = PRESETS.find((p) => p.id === asset.presetId);
  const ext = asset.blob.type.includes("mp4") ? "mp4" : "webm";
  return (
    <figure className={`overflow-hidden rounded-xl border border-line bg-panel ${large ? "w-fit max-w-full" : ""}`}>
      {url && <video src={url} controls loop muted playsInline autoPlay={large} className={`bg-black ${large ? "max-h-[65vh] w-auto max-w-full" : "w-full"}`} style={{ aspectRatio: `${asset.width} / ${asset.height}` }} />}
      <figcaption className="flex items-center justify-between gap-2 p-2 text-xs">
        <span className="text-muted">{preset?.name ?? "Clip"} · {asset.durationS}s · {LABEL_TEXT[asset.label]}</span>
        <button onClick={() => downloadBlob(asset.blob, `kiln-${asset.id.slice(0, 8)}.${ext}`)} className="rounded-full bg-panel-2 px-2.5 py-1">Download</button>
      </figcaption>
    </figure>
  );
}
