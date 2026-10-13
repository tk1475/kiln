"use client";

import { useEffect, useRef, useState } from "react";
import { Asset, downloadBlob, saveAsset } from "@/lib/assets";
import { GLAZES, Glaze } from "@/lib/glaze";
import { loadImage } from "@/lib/image";
import SourcePicker, { Step } from "@/components/SourcePicker";

const MAX = 2048;

export default function GlazePage() {
  const [source, setSource] = useState<Asset>();
  const [img, setImg] = useState<HTMLImageElement>();
  const [glaze, setGlaze] = useState<Glaze>(GLAZES[0]);
  const [k, setK] = useState(0.7);
  const [saved, setSaved] = useState<string>();
  const preview = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!source) return;
    let alive = true;
    loadImage(source.blob).then((i) => alive && setImg(i));
    return () => { alive = false; };
  }, [source]);

  useEffect(() => {
    const c = preview.current;
    if (!c || !img) return;
    const s = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    glaze.apply(c.getContext("2d", { willReadFrequently: true })!, img, k);
  }, [img, glaze, k]);

  const exportFull = async () => {
    if (!img || !source) return;
    const s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    glaze.apply(c.getContext("2d", { willReadFrequently: true })!, img, k);
    const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.93));
    const a: Asset = { id: crypto.randomUUID(), kind: "image", label: "local-edit", createdAt: Date.now(), blob, width: c.width, height: c.height, presetId: glaze.id, sourceId: source.id, prompt: source.prompt };
    await saveAsset(a);
    downloadBlob(blob, `kiln-${glaze.id}-${a.id.slice(0, 6)}.jpg`);
    setSaved(`${glaze.name} saved to your images and downloaded.`);
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
      <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-20 lg:self-start">
        <h1 className="font-display text-4xl uppercase">Glaze</h1>
        <Step n={1} title="Image"><SourcePicker value={source} onChange={(a) => { setSource(a); setSaved(undefined); }} /></Step>
        <Step n={2} title="Intensity">
          <input type="range" min={0} max={1} step={0.05} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full accent-[var(--ember)]" aria-label="Intensity" />
        </Step>
        <button onClick={exportFull} disabled={!img} className="btn-ember rounded-xl py-3 font-semibold disabled:opacity-40">Save &amp; download</button>
        <p className="text-[11px] text-muted">Effects are applied on your device. No AI model is involved.</p>
        <p aria-live="polite" className="text-sm text-ember-2">{saved}</p>
      </aside>

      <section className="flex flex-col gap-4">
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-line bg-panel p-4">
          {img ? <canvas ref={preview} className="max-h-[60vh] max-w-full rounded-xl" aria-label={`Preview with ${glaze.name}`} />
            : <p className="text-muted">Pick an image to glaze.</p>}
        </div>
        <div role="radiogroup" aria-label="Effect" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GLAZES.map((g) => (
            <button key={g.id} role="radio" aria-checked={g.id === glaze.id} onClick={() => setGlaze(g)}
              className={`rounded-2xl border p-3 text-left ${g.id === glaze.id ? "border-ember bg-panel-2" : "border-line bg-panel hover:border-muted"}`}>
              <span className="block font-display text-lg uppercase">{g.name}</span>
              <span className="text-xs text-muted">{g.hint}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
