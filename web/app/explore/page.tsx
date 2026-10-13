"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Asset, LABEL_TEXT, listAssets } from "@/lib/assets";
import { BANNERS, SAMPLES, TOOL_ICONS, icon3d, libraryUrl } from "@/lib/library";
import { PRESETS } from "@/lib/motion";
import { GLAZES } from "@/lib/glaze";
import { useObjectUrl } from "@/components/useObjectUrl";

const TOOLS = [
  { key: "image", href: "/image", name: "Image", line: "Text to image with FLUX.1 schnell" },
  { key: "video", href: "/video", name: "Video", line: "Camera moves for any still" },
  { key: "audio", href: "/audio", name: "Audio", line: "Mood beds to score your clips" },
  { key: "glaze", href: "/glaze", name: "Glaze", line: "Film, glitch and VHS looks", badge: "New" },
  { key: "billboard", href: "/billboard", name: "Billboard", line: "Turn any image into an ad", badge: "New" },
  { key: "splice", href: "/splice", name: "Splice", line: "Cut shots and sound into one edit", badge: "Top" },
];

const BUILT_ON = ["FLUX.1 schnell", "Cloudflare Workers AI", "Web Audio", "Canvas 2D", "MediaRecorder", "IndexedDB", "Next.js"];

const ACTIONS = [
  { href: "/video", label: "Animate" },
  { href: "/glaze", label: "Glaze" },
  { href: "/billboard", label: "Ad" },
];

function Pill({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 font-mono text-xs uppercase tracking-[0.12em] ${dark ? "bg-fg text-bg" : "btn-ember"}`}>
      {children}
      <span className="arrow-dot" aria-hidden style={dark ? { background: "var(--ember)", color: "var(--fg)" } : undefined}>↗</span>
    </Link>
  );
}

function Bubble({ icon, tone }: { icon: string; tone: "lime" | "sky" }) {
  return (
    <span aria-hidden className={`mx-1 inline-grid h-[0.95em] w-[0.95em] translate-y-[0.08em] place-items-center rounded-full align-baseline ${tone === "lime" ? "bg-ember" : "bg-sky-400"}`}>
      <img src={icon3d(icon)} alt="" className="h-[0.7em] w-[0.7em]" />
    </span>
  );
}

export default function ExplorePage() {
  const [recent, setRecent] = useState<Asset[]>([]);
  useEffect(() => {
    listAssets().then((a) => setRecent(a.filter((x) => x.kind !== "audio" && x.label !== "sample").slice(0, 8)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16">
      <section className="relative overflow-hidden rounded-[28px]">
        <img src={libraryUrl(BANNERS[0])} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <div className="relative px-6 pb-56 pt-16 text-white sm:px-10 sm:pb-64 sm:pt-24">
          <h1 className="font-display max-w-2xl text-5xl sm:text-7xl">
            Make it, move it,<br /><span className="text-white/60">score it.</span>
          </h1>
          <p className="mt-5 max-w-md text-white/85">
            Generate an image, give it a camera move, add a soundtrack and cut it into one edit. Open models and on-device
            rendering, free to use.
          </p>
          <div className="mt-8"><Pill href="/image">Get started</Pill></div>
        </div>

        <ul className="absolute inset-x-0 bottom-5 flex gap-3 overflow-x-auto px-5 sm:px-8" aria-label="Highlights">
          <li className="w-56 shrink-0 rounded-2xl bg-white/90 p-3 backdrop-blur">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.slice(0, 6).map((p) => <span key={p.id} className="rounded-full bg-white px-2.5 py-1 text-xs shadow-sm">{p.name}</span>)}
            </div>
            <p className="mt-3 text-xs text-muted">Camera moves</p>
            <p className="font-display text-3xl">{PRESETS.length}</p>
          </li>
          <li className="relative h-40 w-44 shrink-0 overflow-hidden rounded-2xl">
            <img src={libraryUrl(SAMPLES[2])} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-2 bottom-2 rounded-xl bg-white/90 px-2.5 py-1.5 text-xs">
              <span className="block text-muted">Video</span>Push In · 5s
            </span>
          </li>
          <li className="flex w-56 shrink-0 flex-col justify-center rounded-2xl bg-fg p-4 text-bg">
            <p className="text-lg leading-snug">
              Images <span className="inline-block h-2.5 w-2.5 rounded-full bg-ember" aria-hidden /> <span className="text-white/50">motion and sound in one studio</span>
            </p>
          </li>
          <li className="w-60 shrink-0 rounded-2xl bg-white p-3">
            <p className="text-xs text-muted">Glaze looks</p>
            <ul className="mt-2 space-y-1.5">
              {GLAZES.slice(0, 3).map((g) => (
                <li key={g.id} className="flex items-center justify-between rounded-lg bg-panel px-2.5 py-1.5 text-xs">
                  <span>{g.name}</span><span className="text-muted">{g.hint.split(",")[0]}</span>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </section>

      <section className="mt-24 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <p className="eyebrow pt-3">The studio</p>
        <h2 className="font-display text-4xl sm:text-5xl">
          One prompt becomes an <Bubble icon="easel" tone="sky" /> image, a <Bubble icon="clapper" tone="lime" /> shot
          <span className="text-muted"> and a scored edit you can post.</span>
        </h2>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl bg-panel p-5">
          <div className="-mx-5 overflow-hidden">
            <div className="marquee flex w-max gap-1.5 px-5">
              {[...PRESETS, ...PRESETS].map((p, i) => <span key={i} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs">{p.name}</span>)}
            </div>
          </div>
          <div><p className="text-sm text-muted">Camera moves</p><p className="font-display text-5xl">{PRESETS.length}</p></div>
        </div>
        <div className="flex min-h-56 flex-col justify-between rounded-3xl bg-ember p-5">
          <p className="text-sm">Cost to use</p>
          <div><p className="font-display text-5xl">$0</p><p className="mt-3 text-sm">Open models and on-device rendering. No account needed.</p></div>
        </div>
        <div className="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-3xl p-5 text-white">
          <img src={libraryUrl(SAMPLES[9])} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative"><p className="font-display text-5xl">{GLAZES.length}</p><p className="mt-2 text-sm text-white/85">Glaze looks, from film stock to VHS.</p></div>
        </div>
        <div className="flex min-h-56 flex-col justify-between rounded-3xl bg-panel p-5">
          <p className="text-sm text-muted">Sample library</p>
          <div><p className="font-display text-5xl">{SAMPLES.length}</p><p className="mt-3 text-sm">Frames ready to animate, glaze or turn into an ad.</p></div>
        </div>
      </section>

      <section className="mt-12 overflow-hidden" aria-label="Built on">
        <div className="marquee flex w-max gap-12">
          {[...BUILT_ON, ...BUILT_ON].map((t, i) => <span key={i} className="shrink-0 font-mono text-sm uppercase tracking-[0.12em] text-muted">{t}</span>)}
        </div>
      </section>

      <section className="mt-24">
        <p className="eyebrow">Tools</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl sm:text-5xl">Six tools, <span className="text-muted">one workflow.</span></h2>
          <Pill href="/image" dark>Open Image</Pill>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.key}>
              <Link href={t.href} className="group flex h-full flex-col rounded-3xl bg-panel p-5 transition-colors hover:bg-panel-2">
                <img src={icon3d(TOOL_ICONS[t.key])} alt="" className="h-14 w-14 transition-transform group-hover:-translate-y-1 group-hover:rotate-[-6deg]" />
                <p className="mt-8 flex items-center gap-2 text-xl font-medium tracking-tight">
                  {t.name}
                  {t.badge && <span className={t.badge === "Top" ? "badge !bg-white" : "badge"}>{t.badge}</span>}
                </p>
                <p className="text-sm text-muted">{t.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow">Your recent work</p>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recent.map((a) => <RecentTile key={a.id} asset={a} />)}
          </ul>
        </section>
      )}

      <section className="mt-24">
        <p className="eyebrow">Sample library</p>
        <h2 className="font-display mt-4 text-4xl sm:text-5xl">Pick a frame, <span className="text-muted">take it anywhere.</span></h2>
        <ul className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {SAMPLES.map((n) => (
            <li key={n} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-3xl">
              <Image src={libraryUrl(n)} alt="Sample image" width={600} height={800} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="h-auto w-full" />
              <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                {ACTIONS.map((a) => (
                  <Link key={a.href} href={`${a.href}?sample=${n}`} className="rounded-full bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fg hover:bg-ember">{a.label}</Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RecentTile({ asset }: { asset: Asset }) {
  const url = useObjectUrl(asset.blob);
  const href = asset.kind === "image" ? `/video?src=${asset.id}` : "/video";
  return (
    <li>
      <Link href={href} className="relative block aspect-square overflow-hidden rounded-3xl bg-panel">
        {url && (asset.kind === "motion"
          ? <video src={url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          : <img src={url} alt={asset.prompt ?? ""} className="h-full w-full object-cover" />)}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px]">{LABEL_TEXT[asset.label]}</span>
      </Link>
    </li>
  );
}
