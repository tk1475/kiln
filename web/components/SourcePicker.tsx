"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Asset, LABEL_TEXT, getAsset, listAssets, saveAsset } from "@/lib/assets";
import { loadImage } from "@/lib/image";
import { SAMPLES, SampleClip, clipKey, clipUrl, libraryUrl } from "@/lib/library";
import { useObjectUrl } from "@/components/useObjectUrl";
import { mp4Duration } from "@/lib/media";

type Props = { value?: Asset; onChange: (a: Asset) => void };

const inflight = new Map<string, Promise<Asset>>();

/** Imports a library sample as a local asset so every tool can read it as a blob. Concurrent calls share one import. */
export function importSample(name: string): Promise<Asset> {
  let p = inflight.get(name);
  if (!p) {
    p = doImport(name).finally(() => inflight.delete(name));
    inflight.set(name, p);
  }
  return p;
}

async function doImport(name: string): Promise<Asset> {
  const existing = (await listAssets("image")).find((a) => a.label === "sample" && a.presetId === name);
  if (existing) return existing;
  const res = await fetch(libraryUrl(name), { mode: "cors" });
  if (!res.ok) throw new Error("Couldn't load that sample.");
  const blob = await res.blob();
  const i = await loadImage(blob);
  URL.revokeObjectURL(i.src);
  const a: Asset = { id: crypto.randomUUID(), kind: "image", label: "sample", createdAt: Date.now(), blob, width: i.naturalWidth, height: i.naturalHeight, presetId: name };
  await saveAsset(a);
  return a;
}

/** Imports a library sample clip as a local motion asset (label "sample") so Splice can cut it. */
export function importClip(clip: SampleClip): Promise<Asset> {
  const key = `clip:${clipKey(clip)}`;
  let p = inflight.get(key);
  if (!p) {
    p = doImportClip(clip).finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

async function doImportClip(clip: SampleClip): Promise<Asset> {
  const existing = (await listAssets("motion")).find((a) => a.label === "sample" && a.presetId === clipKey(clip));
  if (existing) return existing;
  const res = await fetch(clipUrl(clip), { mode: "cors" });
  if (!res.ok) throw new Error("Couldn't load that clip.");
  const blob = await res.blob();
  const durationS = mp4Duration(new Uint8Array(await blob.arrayBuffer()));
  if (!durationS) throw new Error("Couldn't read that clip.");
  const a: Asset = { id: crypto.randomUUID(), kind: "motion", label: "sample", createdAt: Date.now(), blob, width: clip.w, height: clip.h, presetId: clipKey(clip), durationS };
  await saveAsset(a);
  return a;
}

/** Pick one of your images, a library sample, or add one by upload, drop or paste. Reads ?src= and ?sample=. */
export default function SourcePicker(props: Props) {
  return (
    <Suspense>
      <Picker {...props} />
    </Suspense>
  );
}

function Picker({ value, onChange }: Props) {
  const params = useSearchParams();
  const [images, setImages] = useState<Asset[]>([]);
  const [tab, setTab] = useState<"yours" | "samples">("yours");
  const [loading, setLoading] = useState<string>();
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const changeRef = useRef(onChange);
  useEffect(() => { changeRef.current = onChange; });

  useEffect(() => {
    listAssets("image").then((all) => {
      setImages(all.filter((a) => a.label !== "sample"));
      if (all.every((a) => a.label === "sample")) setTab("samples");
    });
    const src = params.get("src");
    const sample = params.get("sample");
    if (src) getAsset(src).then((a) => a && changeRef.current(a));
    else if (sample && SAMPLES.includes(sample)) importSample(sample).then((a) => { setTab("samples"); changeRef.current(a); }).catch(() => {});
  }, [params]);

  const pickSample = async (name: string) => {
    setLoading(name);
    setError(undefined);
    try { onChange(await importSample(name)); } catch (e) { setError(e instanceof Error ? e.message : "Couldn't load that sample."); }
    setLoading(undefined);
  };

  const addFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) { setError("Choose a PNG, JPG or WebP image."); return; }
    setError(undefined);
    const i = await loadImage(file);
    const a: Asset = { id: crypto.randomUUID(), kind: "image", label: "user-upload", createdAt: Date.now(), blob: file, width: i.naturalWidth, height: i.naturalHeight };
    URL.revokeObjectURL(i.src);
    await saveAsset(a);
    setImages((x) => [a, ...x]);
    setTab("yours");
    onChange(a);
  };

  const importLink = async (e: React.FormEvent) => {
    e.preventDefault();
    let url: URL;
    try { url = new URL(link.trim()); } catch { setError("Paste a full image link starting with https://"); return; }
    setLoading("link");
    setError(undefined);
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      if (!res.ok || !blob.type.startsWith("image/")) throw new Error();
      await addFile(new File([blob], url.pathname.split("/").pop() || url.hostname, { type: blob.type }));
      setLink("");
    } catch {
      setError("That site doesn't allow images to be loaded from here. Save it and upload it instead.");
    }
    setLoading(undefined);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => addFile(e.clipboardData?.files?.[0]);
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); addFile(e.dataTransfer.files[0]); }}
      className="rounded-xl border border-dashed border-line p-2"
    >
      <div role="tablist" className="mb-2 flex rounded-lg bg-panel-2 p-0.5 text-xs">
        {(["yours", "samples"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1 ${tab === t ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>
            {t === "yours" ? `Yours (${images.length})` : "Samples"}
          </button>
        ))}
      </div>

      {tab === "yours" ? (
        images.length > 0 ? (
          <ul className="mb-2 grid max-h-44 grid-cols-4 gap-1.5 overflow-y-auto" aria-label="Your images">
            {images.map((a) => <Thumb key={a.id} asset={a} active={value?.id === a.id} onPick={() => onChange(a)} />)}
          </ul>
        ) : <p className="mb-2 px-1 text-xs text-muted">No images yet. Upload one or try a sample.</p>
      ) : (
        <ul className="mb-2 grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto" aria-label="Sample library">
          {SAMPLES.map((n) => (
            <li key={n}>
              <button onClick={() => pickSample(n)} aria-label="Use sample" aria-pressed={value?.presetId === n}
                className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 ${value?.presetId === n ? "border-fg" : "border-transparent"}`}>
                <Image src={libraryUrl(n)} alt="" fill sizes="90px" className={`object-cover ${loading === n ? "opacity-40" : ""}`} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => fileRef.current?.click()} className="w-full rounded-full bg-panel-2 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-line">Upload image</button>
      <form onSubmit={importLink} className="mt-1.5 flex gap-1">
        <input value={link} onChange={(e) => setLink(e.target.value)} type="url" inputMode="url" placeholder="or paste an image link" aria-label="Image link"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-3 py-1.5 text-xs outline-none focus:border-ember" />
        <button disabled={!link.trim() || loading === "link"} className="rounded-full bg-fg px-3 text-xs text-bg disabled:opacity-40">{loading === "link" ? "…" : "Add"}</button>
      </form>
      <p className="mt-1.5 text-center text-[11px] text-muted">Drop or paste a file too · <Link href="/image" className="underline">generate one</Link></p>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { addFile(e.target.files?.[0]); e.target.value = ""; }} />
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Thumb({ asset, active, onPick }: { asset: Asset; active: boolean; onPick: () => void }) {
  const url = useObjectUrl(asset.blob);
  return (
    <li>
      <button onClick={onPick} aria-pressed={active} aria-label={asset.prompt ?? LABEL_TEXT[asset.label]}
        className={`block aspect-square w-full overflow-hidden rounded-lg border-2 ${active ? "border-fg" : "border-transparent"}`}>
        {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      </button>
    </li>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{n} · {title}</h2>
      {children}
    </section>
  );
}
