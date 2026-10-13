"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Asset, LABEL_TEXT, downloadBlob, listAssets, saveAsset } from "@/lib/assets";
import { MOODS } from "@/lib/audio";
import { MotionAspect, OUTPUT_SIZES } from "@/lib/motion";
import { renderSplice, totalSeconds } from "@/lib/splice";
import { Step } from "@/components/SourcePicker";
import { useObjectUrl } from "@/components/useObjectUrl";

export default function SplicePage() {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Asset[]>([]);
  const [timeline, setTimeline] = useState<Asset[]>([]);
  const [track, setTrack] = useState<Asset>();
  const [aspect, setAspect] = useState<MotionAspect>("9:16");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Asset>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listAssets().then((all) => {
      setLibrary(all.filter((a) => a.kind !== "audio"));
      setTracks(all.filter((a) => a.kind === "audio"));
    });
  }, []);

  const move = (i: number, d: number) =>
    setTimeline((t) => {
      const n = [...t];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });

  const render = async () => {
    setError(undefined);
    setResult(undefined);
    setProgress(0);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const blob = await renderSplice(timeline, aspect, track, setProgress, ctrl.signal);
      const [width, height] = OUTPUT_SIZES[aspect];
      const a: Asset = { id: crypto.randomUUID(), kind: "motion", label: "local-render", createdAt: Date.now(), blob, width, height, presetId: "splice", durationS: Math.round(totalSeconds(timeline)) };
      await saveAsset(a);
      setResult(a);
      setLibrary((l) => [a, ...l]);
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "Render failed.");
    } finally {
      setProgress(null);
    }
  };

  const rendering = progress !== null;

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
      <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-20 lg:self-start">
        <h1 className="font-display text-4xl uppercase">Splice</h1>

        <Step n={1} title="Add shots">
          {library.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              No shots yet. Make an <Link href="/image" className="underline">image</Link> or a <Link href="/video" className="underline">clip</Link> first.
            </p>
          ) : (
            <ul className="grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto">
              {library.map((a) => (
                <li key={a.id}>
                  <button onClick={() => setTimeline((t) => [...t, a])} aria-label={`Add ${a.kind === "image" ? "image" : "clip"} to timeline`}
                    className="relative block aspect-square w-full overflow-hidden rounded-lg border border-line hover:border-ember">
                    <Media asset={a} />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[10px]">{a.kind === "image" ? "IMG" : `${a.durationS}s`}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Step>

        <Step n={2} title={`Timeline · ${totalSeconds(timeline).toFixed(1)}s`}>
          {timeline.length === 0 ? <p className="text-sm text-muted">Tap shots above to add them in order.</p> : (
            <ol className="space-y-1.5">
              {timeline.map((a, i) => (
                <li key={`${a.id}-${i}`} className="flex items-center gap-2 rounded-lg bg-panel-2 p-1.5 text-xs">
                  <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded"><Media asset={a} /></span>
                  <span className="flex-1 truncate">{i + 1}. {a.kind === "image" ? "Still · 2.5s push-in" : `Clip · ${a.durationS}s`}</span>
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="px-1 disabled:opacity-30">↑</button>
                  <button aria-label="Move down" disabled={i === timeline.length - 1} onClick={() => move(i, 1)} className="px-1 disabled:opacity-30">↓</button>
                  <button aria-label="Remove" onClick={() => setTimeline((t) => t.filter((_, j) => j !== i))} className="px-1 text-muted hover:text-danger">✕</button>
                </li>
              ))}
            </ol>
          )}
        </Step>

        <Step n={3} title="Soundtrack">
          <select value={track?.id ?? ""} onChange={(e) => setTrack(tracks.find((t) => t.id === e.target.value))}
            className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm" aria-label="Soundtrack">
            <option value="">None</option>
            {tracks.map((t) => <option key={t.id} value={t.id}>{MOODS.find((m) => m.id === t.presetId)?.name} · {t.durationS}s</option>)}
          </select>
          {tracks.length === 0 && <p className="mt-1 text-[11px] text-muted"><Link href="/audio" className="underline">Render a track</Link> to score your edit.</p>}
        </Step>

        <div role="radiogroup" aria-label="Aspect" className="flex rounded-lg bg-panel-2 p-0.5">
          {(Object.keys(OUTPUT_SIZES) as MotionAspect[]).map((o) => (
            <button key={o} role="radio" aria-checked={o === aspect} onClick={() => setAspect(o)}
              className={`flex-1 rounded-md py-1 text-xs ${o === aspect ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>{o}</button>
          ))}
        </div>

        {rendering ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-label="Render progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="btn-ember h-full" style={{ width: `${progress * 100}%` }} />
            </div>
            <button onClick={() => abortRef.current?.abort()} className="mt-2 w-full rounded-xl bg-panel-2 py-2 text-sm">Cancel</button>
          </div>
        ) : (
          <button onClick={render} disabled={timeline.length === 0} className="btn-ember rounded-xl py-3 font-semibold disabled:opacity-40">Render edit</button>
        )}
        <p className="text-[11px] text-muted">Cut together on your device in real time. Keep this tab visible while it renders.</p>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </aside>

      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-line bg-panel p-4">
        {result ? <Result asset={result} /> : <p className="max-w-xs text-center text-muted">Build a timeline of stills and clips, add a soundtrack, and render one shareable edit.</p>}
      </section>
    </div>
  );
}

function Media({ asset }: { asset: Asset }) {
  const url = useObjectUrl(asset.blob);
  if (!url) return null;
  return asset.kind === "image"
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={url} alt="" className="h-full w-full object-cover" />
    : <video src={`${url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />;
}

function Result({ asset }: { asset: Asset }) {
  const url = useObjectUrl(asset.blob);
  const ext = asset.blob.type.includes("mp4") ? "mp4" : "webm";
  return (
    <figure className="w-fit max-w-full overflow-hidden rounded-xl border border-line">
      {url && <video src={url} controls autoPlay playsInline className="max-h-[70vh] w-auto max-w-full bg-black" />}
      <figcaption className="flex items-center justify-between gap-2 bg-panel p-2 text-xs">
        <span className="text-muted">Edit · {asset.durationS}s · {LABEL_TEXT[asset.label]}</span>
        <button onClick={() => downloadBlob(asset.blob, `kiln-edit-${asset.id.slice(0, 6)}.${ext}`)} className="rounded-full bg-panel-2 px-2.5 py-1">Download</button>
      </figcaption>
    </figure>
  );
}
