"use client";

import ToolHeader from "@/components/ToolHeader";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Asset, LABEL_TEXT, downloadBlob, listAssets, saveAsset } from "@/lib/assets";
import { MOODS } from "@/lib/audio";
import { loadImage } from "@/lib/image";
import { probeVideo } from "@/lib/media";
import { MotionAspect, OUTPUT_SIZES } from "@/lib/motion";
import { renderSplice, totalSeconds } from "@/lib/splice";
import { Step, importClip } from "@/components/SourcePicker";
import { useObjectUrl } from "@/components/useObjectUrl";
import { CLIPS, SampleClip, clipKey, clipPoster, icon3d } from "@/lib/library";

export default function SplicePage() {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Asset[]>([]);
  const [timeline, setTimeline] = useState<Asset[]>([]);
  const [track, setTrack] = useState<Asset>();
  const [aspect, setAspect] = useState<MotionAspect>("9:16");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Asset>();
  const [clipLoading, setClipLoading] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);

  const addClip = async (c: SampleClip) => {
    setClipLoading(clipKey(c));
    setError(undefined);
    try {
      const a = await importClip(c);
      setTimeline((t) => [...t, a]);
      setLibrary((l) => (l.some((x) => x.id === a.id) ? l : [a, ...l]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load that clip.");
    }
    setClipLoading(undefined);
  };

  useEffect(() => {
    listAssets().then((all) => {
      setLibrary(all.filter((a) => a.kind !== "audio"));
      setTracks(all.filter((a) => a.kind === "audio"));
      // Hand-offs from other studios: /splice?add=<id>[,<id>] and /splice?track=<id>
      const q = new URLSearchParams(location.search);
      const add = (q.get("add") ?? "").split(",").map((id) => all.find((a) => a.id === id && a.kind !== "audio")).filter((a): a is Asset => !!a);
      if (add.length) setTimeline(add);
      const t = all.find((a) => a.id === q.get("track") && a.kind === "audio");
      if (t) setTrack(t);
    });
  }, []);

  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(undefined);
    for (const file of Array.from(files)) {
      try {
        const base = { id: crypto.randomUUID(), label: "user-upload" as const, createdAt: Date.now(), blob: file, prompt: file.name };
        if (file.type.startsWith("image/")) {
          const i = await loadImage(file);
          URL.revokeObjectURL(i.src);
          const a: Asset = { ...base, kind: "image", width: i.naturalWidth, height: i.naturalHeight };
          await saveAsset(a);
          setLibrary((l) => [a, ...l]);
          setTimeline((t) => [...t, a]);
        } else if (file.type.startsWith("video/")) {
          const a: Asset = { ...base, kind: "motion", ...(await probeVideo(file)) };
          await saveAsset(a);
          setLibrary((l) => [a, ...l]);
          setTimeline((t) => [...t, a]);
        } else if (file.type.startsWith("audio/")) {
          const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await file.arrayBuffer());
          const a: Asset = { ...base, kind: "audio", width: 0, height: 0, durationS: Math.round(buf.duration) };
          await saveAsset(a);
          setTracks((t) => [a, ...t]);
          setTrack(a);
        } else {
          setError(`${file.name} isn't an image, video or audio file.`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : `Couldn't read ${file.name}.`);
      }
    }
  };

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
      <aside
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="flex flex-col gap-4 rounded-3xl bg-panel p-4 lg:sticky lg:top-20 lg:self-start"
      >
        <ToolHeader tool="splice" eyebrow="Studio" title="Splice" line="Cut shots and sound into one edit." />

        <Step n={1} title="Add shots">
          {library.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              No shots of your own yet. Make an <Link href="/image" className="underline">image</Link> or a <Link href="/video" className="underline">clip</Link> first.
            </p>
          ) : (
            <ul className="grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto">
              {library.map((a) => (
                <li key={a.id}>
                  <button onClick={() => setTimeline((t) => [...t, a])} aria-label={`Add ${a.kind === "image" ? "image" : "clip"} to timeline`}
                    className="relative block aspect-square w-full overflow-hidden rounded-lg border border-line hover:border-fg">
                    <Media asset={a} />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[10px]">{a.kind === "image" ? "IMG" : `${a.durationS}s`}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Step>

        <div>
          <p className="mb-1.5 text-[11px] text-muted">Sample clips · reference footage from the asset library</p>
          <ul className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Sample clips">
            {CLIPS.map((c) => (
              <li key={clipKey(c)} className="shrink-0">
                <button onClick={() => addClip(c)} disabled={!!clipLoading} aria-label={`Add sample clip ${c.id} to timeline`}
                  className="relative block h-12 w-20 overflow-hidden rounded-lg border border-line hover:border-fg disabled:cursor-wait">
                  <Image src={clipPoster(c)} alt="" fill sizes="80px" className={`object-cover ${clipLoading === clipKey(c) ? "opacity-40" : ""}`} />
                  {clipLoading === clipKey(c) && <span className="absolute inset-0 grid place-items-center text-[10px] text-white">Loading</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => fileRef.current?.click()} className="w-full rounded-full bg-panel-2 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-line">
          Upload images, clips or music
        </button>
        <p className="-mt-2 text-center text-[11px] text-muted">or drop files anywhere on this panel</p>
        <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,audio/*" className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

        <Step n={2} title={`Timeline · ${totalSeconds(timeline).toFixed(1)}s`}>
          {timeline.length === 0 ? <p className="text-sm text-muted">Tap shots above to add them in order.</p> : (
            <ol className="space-y-1.5">
              <AnimatePresence initial={false}>
              {timeline.map((a, i) => (
                <motion.li key={`${a.id}-${timeline.slice(0, i).filter((x) => x.id === a.id).length}`} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-2 rounded-lg bg-panel-2 p-1.5 text-xs">
                  <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded"><Media asset={a} /></span>
                  <span className="flex-1 truncate">{i + 1}. {a.kind === "image" ? "Still · 2.5s push-in" : `${a.label === "sample" ? "Sample clip" : "Clip"} · ${a.durationS}s`}</span>
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="px-1 disabled:opacity-30">↑</button>
                  <button aria-label="Move down" disabled={i === timeline.length - 1} onClick={() => move(i, 1)} className="px-1 disabled:opacity-30">↓</button>
                  <button aria-label="Remove" onClick={() => setTimeline((t) => t.filter((_, j) => j !== i))} className="px-1 text-muted hover:text-danger">✕</button>
                </motion.li>
              ))}
              </AnimatePresence>
            </ol>
          )}
        </Step>

        <Step n={3} title="Soundtrack">
          <select value={track?.id ?? ""} onChange={(e) => setTrack(tracks.find((t) => t.id === e.target.value))}
            className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm focus:border-ember" aria-label="Soundtrack">
            <option value="">None</option>
            {tracks.map((t) => <option key={t.id} value={t.id}>{MOODS.find((m) => m.id === t.presetId)?.name ?? t.prompt ?? "Track"} · {t.durationS}s</option>)}
          </select>
          {tracks.length === 0 && <p className="mt-1 text-[11px] text-muted"><Link href="/audio" className="underline">Render a track</Link> or upload one above to score your edit.</p>}
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
            <button onClick={() => abortRef.current?.abort()} className="mt-2 w-full rounded-full bg-panel-2 py-2 font-mono text-xs uppercase tracking-[0.12em]">Cancel</button>
          </div>
        ) : (
          <button onClick={render} disabled={timeline.length === 0} className="btn-ember rounded-full py-3 font-semibold disabled:opacity-40">Render edit</button>
        )}
        <p className="text-[11px] text-muted">Cut together on your device in real time. Keep this tab visible while it renders.</p>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </aside>

      <section className="flex min-h-[420px] items-center justify-center rounded-3xl bg-panel p-4">
        {result ? <Result asset={result} /> : <div className="flex flex-col items-center gap-3 text-center"><img src={icon3d("filmreel")} alt="" className="h-16 w-16" /><p className="max-w-xs text-center text-muted">Build a timeline of stills and clips, add a soundtrack, and render one shareable edit.</p></div>}
      </section>
    </div>
  );
}

function Media({ asset }: { asset: Asset }) {
  const url = useObjectUrl(asset.blob);
  if (!url) return null;
  return asset.kind === "image"
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
