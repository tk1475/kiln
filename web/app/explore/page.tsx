"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Asset, LABEL_TEXT, listAssets } from "@/lib/assets";
import { BANNERS, SAMPLES, TOOL_ICONS, icon3d, libraryUrl } from "@/lib/library";
import { useObjectUrl } from "@/components/useObjectUrl";

const HERO = [
  { href: "/image", title: "Image", line: "Type a scene, get a frame", banner: BANNERS[0] },
  { href: "/video", title: "Video", line: "Nine camera moves for any still", banner: BANNERS[1] },
  { href: "/splice", title: "Splice", line: "Cut shots and sound into one edit", banner: BANNERS[2] },
];

const TOOLS = [
  { key: "image", href: "/image", name: "Image", line: "Text to image with FLUX.1 schnell" },
  { key: "video", href: "/video", name: "Video", line: "Camera moves for any still" },
  { key: "audio", href: "/audio", name: "Audio", line: "Mood beds to score your clips" },
  { key: "glaze", href: "/glaze", name: "Glaze", line: "Film, glitch and VHS looks", badge: "New" },
  { key: "billboard", href: "/billboard", name: "Billboard", line: "Turn any image into an ad", badge: "New" },
  { key: "splice", href: "/splice", name: "Splice", line: "Cut shots and sound into one edit", badge: "Top" },
];

const ACTIONS = [
  { href: "/video", label: "Animate" },
  { href: "/glaze", label: "Glaze" },
  { href: "/billboard", label: "Ad" },
];

export default function ExplorePage() {
  const [recent, setRecent] = useState<Asset[]>([]);
  useEffect(() => {
    listAssets().then((a) => setRecent(a.filter((x) => x.kind !== "audio" && x.label !== "sample").slice(0, 8)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {HERO.map((h) => (
          <li key={h.href} className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[36%]">
            <Link href={h.href} className="group block">
              <div className="overflow-hidden rounded-2xl">
                <img src={libraryUrl(h.banner)} alt="" className="aspect-[2048/864] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-3 font-display text-2xl uppercase">{h.title}</p>
              <p className="text-sm text-muted">{h.line}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-line">
          <img src={libraryUrl(BANNERS[6])} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-8">
            <h1 className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              Make it. <span className="bg-gradient-to-r from-ember to-ember-2 bg-clip-text text-transparent">Move it.</span><br />Score it.
            </h1>
            <p className="mt-3 max-w-md text-muted">An image, a camera move and a soundtrack, cut into one edit. Free, open models, nothing to install.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/image" className="btn-ember rounded-xl px-5 py-3 font-semibold">Start with an image</Link>
              <Link href="/video" className="rounded-xl bg-panel-2 px-5 py-3 font-medium">Animate a photo</Link>
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.key}>
              <Link href={t.href} className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-ember/60">
                <img src={icon3d(TOOL_ICONS[t.key])} alt="" className="h-12 w-12 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]" />
                <p className="mt-4 flex items-center gap-2 font-semibold">
                  {t.name}
                  {t.badge && <span className={t.badge === "Top" ? "badge !bg-fg !text-bg" : "badge"}>{t.badge}</span>}
                </p>
                <p className="text-xs text-muted">{t.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-3xl uppercase">Your recent work</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((a) => <RecentTile key={a.id} asset={a} />)}
          </ul>
        </section>
      )}

      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl uppercase">Sample library</h2>
            <p className="text-sm text-muted">Pick any frame and take it straight into a tool.</p>
          </div>
        </div>
        <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {SAMPLES.map((n) => (
            <li key={n} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-line">
              <img src={libraryUrl(n)} alt="Sample image" loading="lazy" className="w-full" />
              <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                {ACTIONS.map((a) => (
                  <Link key={a.href} href={`${a.href}?sample=${n}`} className="rounded-full bg-fg/90 px-3 py-1 text-xs font-semibold text-bg hover:bg-ember">{a.label}</Link>
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
      <Link href={href} className="relative block aspect-square overflow-hidden rounded-xl border border-line bg-black">
        {url && (asset.kind === "motion"
          ? <video src={url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          : <img src={url} alt={asset.prompt ?? ""} className="h-full w-full object-cover" />)}
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px]">{LABEL_TEXT[asset.label]}</span>
      </Link>
    </li>
  );
}
