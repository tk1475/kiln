"use client";

import ToolHeader from "@/components/ToolHeader";
import NextSteps from "@/components/NextSteps";
import { useEffect, useRef, useState } from "react";
import { Asset, downloadBlob, saveAsset } from "@/lib/assets";
import { loadImage } from "@/lib/image";
import SourcePicker, { Step } from "@/components/SourcePicker";
import { icon3d } from "@/lib/library";

const FORMATS = { Square: [1080, 1080], Story: [1080, 1920], Landscape: [1920, 1080] } as const;
type Format = keyof typeof FORMATS;
const LAYOUTS = ["Band", "Center", "Split"] as const;
type Layout = (typeof LAYOUTS)[number];

interface Copy { headline: string; sub: string; cta: string }

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / s, sh = h / s;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, layout: Layout, copy: Copy, display: string) {
  const { width: W, height: H } = ctx.canvas;
  const pad = Math.round(Math.min(W, H) * 0.07);
  const big = Math.round(Math.min(W, H) * (layout === "Center" ? 0.13 : 0.1));
  let textW = W - pad * 2;
  let originY = H - pad;

  ctx.fillStyle = "#0c0d0e";
  ctx.fillRect(0, 0, W, H);
  if (layout === "Split") {
    const tall = H > W;
    const iw = tall ? W : W * 0.55, ih = tall ? H * 0.58 : H;
    cover(ctx, img, 0, 0, iw, ih);
    if (!tall) { textW = W - iw - pad * 2; }
  } else {
    cover(ctx, img, 0, 0, W, H);
    const g = ctx.createLinearGradient(0, layout === "Center" ? 0 : H * 0.35, 0, H);
    g.addColorStop(0, `rgba(12,13,14,${layout === "Center" ? 0.45 : 0})`);
    g.addColorStop(1, "rgba(12,13,14,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.letterSpacing = `${-0.04 * big}px`;
  ctx.font = `600 ${big}px ${display}`;
  const headLines = wrap(ctx, copy.headline, textW);
  ctx.font = `${Math.round(big * 0.32)}px system-ui, sans-serif`;
  const subLines = wrap(ctx, copy.sub, textW);
  const ctaH = copy.cta ? Math.round(big * 0.55) : 0;
  const blockH = headLines.length * big * 0.98 + subLines.length * big * 0.42 + (ctaH ? ctaH + big * 0.35 : 0);

  let x = pad;
  let align: CanvasTextAlign = "left";
  if (layout === "Center") { x = W / 2; align = "center"; originY = (H + blockH) / 2; }
  if (layout === "Split" && W >= H) { x = W * 0.55 + pad; originY = (H + blockH) / 2; }
  let y = originY - blockH;

  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#f4f4f5";
  ctx.letterSpacing = `${-0.04 * big}px`;
  ctx.font = `600 ${big}px ${display}`;
  for (const l of headLines) { ctx.fillText(l, x, y); y += big * 0.98; }
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "rgba(244,244,245,0.75)";
  ctx.font = `${Math.round(big * 0.32)}px system-ui, sans-serif`;
  y += big * 0.08;
  for (const l of subLines) { ctx.fillText(l, x, y); y += big * 0.42; }

  if (copy.cta) {
    y += big * 0.27;
    ctx.font = `600 ${Math.round(ctaH * 0.42)}px system-ui, sans-serif`;
    const w = ctx.measureText(copy.cta).width + ctaH;
    const bx = align === "center" ? x - w / 2 : x;
    ctx.fillStyle = "#2f6bff";
    ctx.beginPath();
    ctx.roundRect(bx, y, w, ctaH, ctaH / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(copy.cta, bx + w / 2, y + ctaH / 2);
  }
}

export default function BillboardPage() {
  const [source, setSource] = useState<Asset>();
  const [img, setImg] = useState<HTMLImageElement>();
  const [format, setFormat] = useState<Format>("Square");
  const [layout, setLayout] = useState<Layout>("Band");
  const [copy, setCopy] = useState<Copy>({ headline: "Made in the kiln", sub: "Fresh visuals, fired up in seconds.", cta: "Try it free" });
  const [display, setDisplay] = useState("sans-serif");
  const [saved, setSaved] = useState<string>();
  const [output, setOutput] = useState<Asset>();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim() || "sans-serif";
    document.fonts.load(`600 80px ${fam}`).then(() => setDisplay(fam));
  }, []);

  useEffect(() => {
    if (!source) return;
    let alive = true;
    loadImage(source.blob).then((i) => alive && setImg(i));
    return () => { alive = false; };
  }, [source]);

  useEffect(() => {
    const c = ref.current;
    if (!c || !img) return;
    [c.width, c.height] = FORMATS[format];
    draw(c.getContext("2d")!, img, layout, copy, display);
  }, [img, format, layout, copy, display]);

  const save = async () => {
    const c = ref.current;
    if (!c || !source) return;
    const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/png"));
    const a: Asset = { id: crypto.randomUUID(), kind: "image", label: "local-edit", createdAt: Date.now(), blob, width: c.width, height: c.height, prompt: copy.headline, sourceId: source.id };
    await saveAsset(a);
    downloadBlob(blob, `kiln-ad-${format.toLowerCase()}-${a.id.slice(0, 6)}.png`);
    setSaved(`${format} ad saved and downloaded.`);
    setOutput(a);
  };

  const field = (k: keyof Copy, label: string, max: number) => (
    <label className="block text-xs text-muted">
      {label}
      <input value={copy[k]} maxLength={max} onChange={(e) => setCopy((c) => ({ ...c, [k]: e.target.value }))}
        className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-ember" />
    </label>
  );

  const seg = <T extends string>(label: string, opts: readonly T[], v: T, set: (x: T) => void) => (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <div className="flex rounded-lg bg-panel-2 p-0.5">
        {opts.map((o) => (
          <button key={o} role="radio" aria-checked={o === v} onClick={() => set(o)}
            className={`flex-1 rounded-md py-1 text-xs ${o === v ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
      <aside className="flex flex-col gap-4 rounded-3xl bg-panel p-4 lg:sticky lg:top-20 lg:self-start">
        <ToolHeader tool="billboard" eyebrow="Studio" title="Billboard" line="Turn any image into an ad." />
        <Step n={1} title="Hero image"><SourcePicker value={source} onChange={(a) => { setSource(a); setSaved(undefined); setOutput(undefined); }} /></Step>
        <Step n={2} title="Copy">
          <div className="space-y-2">{field("headline", "Headline", 48)}{field("sub", "Supporting line", 90)}{field("cta", "Button", 24)}</div>
        </Step>
        <Step n={3} title="Layout">
          <div className="space-y-2">{seg("Format", Object.keys(FORMATS) as Format[], format, setFormat)}{seg("Style", LAYOUTS, layout, setLayout)}</div>
        </Step>
        <button onClick={save} disabled={!img} className="btn-ember rounded-full py-3 font-semibold disabled:opacity-40">Save &amp; download PNG</button>
        <p aria-live="polite" className="text-sm text-ember-2">{saved}</p>
      </aside>
      <div className="flex flex-col gap-6">
      <section className="flex min-h-[420px] items-center justify-center rounded-3xl bg-panel p-4">
        {img ? <canvas ref={ref} className="max-h-[75vh] max-w-full rounded-xl shadow-2xl" aria-label="Ad preview" />
          : <div className="flex flex-col items-center gap-3 text-center"><img src={icon3d("megaphone")} alt="" className="h-16 w-16" /><p className="text-muted">Pick a hero image to start your ad.</p></div>}
      </section>
      {output && <NextSteps asset={output} from="billboard" />}
      </div>
    </div>
  );
}
