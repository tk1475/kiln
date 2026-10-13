"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Asset, LABEL_TEXT, deleteAsset, downloadBlob, listAssets, saveAsset } from "@/lib/assets";
import { ASPECTS, AspectId, cropToAspect } from "@/lib/image";
import { useObjectUrl } from "@/components/useObjectUrl";
import { SAMPLES, libraryUrl } from "@/lib/library";

type Job = { id: string; prompt: string; aspect: AspectId; status: "running" | "error"; error?: string };

const EXAMPLES = [
  "A lighthouse on a basalt cliff at dusk, storm light, 35mm film",
  "Macro shot of a glass beetle on wet moss, studio lighting",
  "Retro-futurist ramen stall in the rain, neon reflections",
  "Portrait of an elderly potter in her workshop, window light",
];

const ratio = (aspect: string) => aspect.replace(":", " / ");

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectId>("1:1");
  const [count, setCount] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [announce, setAnnounce] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listAssets("image").then(setAssets);
    fetch("/api/image").then((r) => r.json()).then((d) => setConfigured(d.configured)).catch(() => setConfigured(false));
  }, []);

  const runJob = useCallback(async (job: Job) => {
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: job.prompt, seed: Math.floor(Math.random() * 2 ** 31) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error?.message ?? "Generation failed.");
      }
      const { blob, width, height } = await cropToAspect(await res.blob(), job.aspect);
      const asset: Asset = {
        id: job.id, kind: "image", label: "ai-generated", createdAt: Date.now(),
        blob, width, height, prompt: job.prompt, model: "flux-1-schnell", aspect: job.aspect,
      };
      await saveAsset(asset);
      setAssets((a) => [asset, ...a]);
      setJobs((j) => j.filter((x) => x.id !== job.id));
      setAnnounce("Image ready.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed.";
      setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: "error", error: msg } : x)));
      setAnnounce(`Generation failed: ${msg}`);
    }
  }, []);

  const generate = () => {
    const p = prompt.trim();
    if (!p || !configured) return;
    const fresh: Job[] = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(), prompt: p, aspect, status: "running",
    }));
    setJobs((j) => [...fresh, ...j]);
    setAnnounce(`Generating ${count} image${count > 1 ? "s" : ""}.`);
    fresh.forEach(runJob);
  };

  const retry = (job: Job) => {
    const next = { ...job, status: "running" as const, error: undefined };
    setJobs((j) => j.map((x) => (x.id === job.id ? next : x)));
    runJob(next);
  };

  const remove = async (id: string) => {
    await deleteAsset(id);
    setAssets((a) => a.filter((x) => x.id !== id));
  };

  const remix = (a: Asset) => {
    setPrompt(a.prompt ?? "");
    if (a.aspect) setAspect(a.aspect as AspectId);
    inputRef.current?.focus();
  };

  const empty = jobs.length === 0 && assets.length === 0;
  const canGenerate = configured === true && prompt.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-48">
      <p className="sr-only" aria-live="polite">{announce}</p>

      {configured === false && (
        <div role="status" className="mt-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-muted">
          Image generation isn&apos;t configured on this deployment yet (missing model credentials). You can still use{" "}
          <Link href="/video" className="text-ember underline">Video</Link> with your own images.
        </div>
      )}

      {empty ? (
        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div aria-hidden className="mb-8 flex items-end justify-center">
            {SAMPLES.slice(0, 5).map((n, i) => (
              <img key={n} src={libraryUrl(n)} alt="" className="-mx-3 h-28 w-20 rounded-xl border-2 border-panel object-cover shadow-2xl sm:h-36 sm:w-28"
                style={{ transform: `rotate(${(i - 2) * 7}deg) translateY(${Math.abs(i - 2) * 10}px)`, zIndex: 5 - Math.abs(i - 2) }} />
            ))}
          </div>
          <h1 className="font-display text-5xl uppercase sm:text-6xl">
            Fire up an <span className="bg-gradient-to-r from-ember to-ember-2 bg-clip-text text-transparent">image</span>
          </h1>
          <p className="mt-3 max-w-md text-muted">
            Describe a scene. Kiln renders it with FLUX.1 schnell, an open model, then you can set it in motion.
          </p>
          <ul className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <button
                  onClick={() => { setPrompt(ex); inputRef.current?.focus(); }}
                  className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-left text-sm text-muted transition-colors hover:border-ember/60 hover:text-fg"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-label="Results" className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {jobs.map((j) => (
            <div key={j.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-panel">
              {j.status === "running" ? (
                <div className="kiln-loading relative" style={{ aspectRatio: ratio(j.aspect) }}>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-1 text-xs text-fg/80">Firing…</span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 p-4" style={{ aspectRatio: ratio(j.aspect) }}>
                  <p className="text-sm text-danger">{j.error}</p>
                  <div className="flex gap-2">
                    <button onClick={() => retry(j)} className="rounded-full bg-panel-2 px-3 py-1.5 text-sm">Retry</button>
                    <button onClick={() => setJobs((x) => x.filter((y) => y.id !== j.id))} className="rounded-full px-3 py-1.5 text-sm text-muted">Dismiss</button>
                  </div>
                </div>
              )}
              <p className="line-clamp-2 px-3 py-2 text-xs text-muted">{j.prompt}</p>
            </div>
          ))}
          {assets.map((a) => (
            <ResultCard key={a.id} asset={a} onRemix={() => remix(a)} onDelete={() => remove(a.id)} />
          ))}
        </section>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); generate(); }}
        className="fixed inset-x-0 bottom-4 z-20 mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-2xl border border-line bg-panel/95 p-3 shadow-2xl backdrop-blur"
      >
        <label htmlFor="prompt" className="sr-only">Prompt</label>
        <textarea
          id="prompt"
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); generate(); } }}
          rows={2}
          maxLength={1000}
          placeholder="Describe the scene you want to fire up…"
          className="w-full resize-none bg-transparent px-2 py-1 text-base outline-none placeholder:text-muted/70"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Aspect ratio" className="flex rounded-full bg-panel-2 p-1">
            {ASPECTS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={aspect === a.id}
                onClick={() => setAspect(a.id)}
                className={`rounded-full px-2.5 py-1 text-xs tabular-nums ${aspect === a.id ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
              >
                {a.id}
              </button>
            ))}
          </div>
          <div className="flex items-center rounded-full bg-panel-2 px-1" aria-label="Number of images">
            <button type="button" aria-label="Fewer images" disabled={count <= 1} onClick={() => setCount((c) => c - 1)} className="px-2 py-1 text-muted disabled:opacity-30">−</button>
            <span className="w-8 text-center text-xs tabular-nums" aria-live="polite">{count}/4</span>
            <button type="button" aria-label="More images" disabled={count >= 4} onClick={() => setCount((c) => c + 1)} className="px-2 py-1 text-muted disabled:opacity-30">+</button>
          </div>
          <span className="hidden text-xs text-muted sm:inline">FLUX.1 schnell · free tier</span>
          <button
            type="submit"
            disabled={!canGenerate}
            title={configured === false ? "Generation isn't configured" : undefined}
            className="btn-ember ml-auto rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          >
            Generate <span className="ml-1 hidden text-xs font-normal opacity-70 sm:inline">⌘↵</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function ResultCard({ asset, onRemix, onDelete }: { asset: Asset; onRemix: () => void; onDelete: () => void }) {
  const url = useObjectUrl(asset.blob);
  const [copied, setCopied] = useState(false);
  return (
    <figure className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative" style={{ aspectRatio: `${asset.width} / ${asset.height}` }}>
        {url && (
          <img src={url} alt={asset.prompt ?? "Generated image"} className="h-full w-full object-cover" />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-fg/90">
          {LABEL_TEXT[asset.label]}
        </span>
      </div>
      <figcaption className="space-y-2 p-3">
        <p className="line-clamp-2 text-xs text-muted">{asset.prompt}</p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link href={`/video?src=${asset.id}`} className="btn-ember rounded-full px-3 py-1 font-medium">Animate</Link>
          <button onClick={() => downloadBlob(asset.blob, `kiln-${asset.id.slice(0, 8)}.jpg`)} className="rounded-full bg-panel-2 px-3 py-1">Download</button>
          <button onClick={onRemix} className="rounded-full bg-panel-2 px-3 py-1">Remix</button>
          <button
            onClick={async () => { await navigator.clipboard.writeText(asset.prompt ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
            className="rounded-full bg-panel-2 px-3 py-1"
          >
            {copied ? "Copied" : "Copy prompt"}
          </button>
          <button onClick={onDelete} aria-label="Delete image" className="ml-auto rounded-full px-2 py-1 text-muted hover:text-danger">Delete</button>
        </div>
      </figcaption>
    </figure>
  );
}
