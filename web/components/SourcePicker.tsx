"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Asset, LABEL_TEXT, listAssets, saveAsset } from "@/lib/assets";
import { loadImage } from "@/lib/image";
import { useObjectUrl } from "@/components/useObjectUrl";

/** Pick a saved image or add one by upload, drop or paste. */
export default function SourcePicker({ value, onChange }: { value?: Asset; onChange: (a: Asset) => void }) {
  const [images, setImages] = useState<Asset[]>([]);
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listAssets("image").then(setImages);
  }, []);

  const addFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) { setError("Choose a PNG, JPG or WebP image."); return; }
    setError(undefined);
    const i = await loadImage(file);
    const a: Asset = { id: crypto.randomUUID(), kind: "image", label: "user-upload", createdAt: Date.now(), blob: file, width: i.naturalWidth, height: i.naturalHeight };
    URL.revokeObjectURL(i.src);
    await saveAsset(a);
    setImages((x) => [a, ...x]);
    onChange(a);
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
      {images.length > 0 && (
        <ul className="mb-2 grid max-h-44 grid-cols-4 gap-1.5 overflow-y-auto" aria-label="Your images">
          {images.map((a) => <Thumb key={a.id} asset={a} active={value?.id === a.id} onPick={() => onChange(a)} />)}
        </ul>
      )}
      <button onClick={() => fileRef.current?.click()} className="w-full rounded-lg bg-panel-2 py-2 text-sm">Upload image</button>
      <p className="mt-1.5 text-center text-[11px] text-muted">or drop / paste · <Link href="/image" className="underline">generate one</Link></p>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => addFile(e.target.files?.[0])} />
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Thumb({ asset, active, onPick }: { asset: Asset; active: boolean; onPick: () => void }) {
  const url = useObjectUrl(asset.blob);
  return (
    <li>
      <button onClick={onPick} aria-pressed={active} aria-label={asset.prompt ?? LABEL_TEXT[asset.label]}
        className={`block aspect-square w-full overflow-hidden rounded-lg border-2 ${active ? "border-ember" : "border-transparent"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
