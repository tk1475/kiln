"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Asset, LABEL_TEXT, listAssets } from "@/lib/assets";
import { useObjectUrl } from "@/components/useObjectUrl";

const TOOLS = [
  { href: "/image", name: "Image", line: "Text to image with FLUX.1 schnell", art: "radial-gradient(circle at 30% 30%, #ffb547 0, transparent 40%), radial-gradient(circle at 70% 70%, #ff6a3d 0, transparent 45%), #2a1408" },
  { href: "/video", name: "Video", line: "Nine camera moves for any still", art: "repeating-linear-gradient(100deg, rgba(15,13,12,.55) 0 18px, rgba(255,181,71,.35) 18px 20px), linear-gradient(135deg, #2a1408, #ff6a3d)" },
  { href: "/audio", name: "Audio", line: "Mood beds to score your clips", art: "repeating-linear-gradient(90deg, transparent 0 10px, rgba(255,181,71,.55) 10px 13px), linear-gradient(180deg, #1a1715, #5a3322)" },
  { href: "/glaze", name: "Glaze", line: "Film, glitch and VHS looks", badge: "New", art: "repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 2px, transparent 2px 4px), linear-gradient(90deg, #ff3d6a, #ff6a3d 50%, #3dd6ff)" },
  { href: "/billboard", name: "Billboard", line: "Turn any image into an ad", badge: "New", art: "linear-gradient(180deg, transparent 55%, #0c0d0e 55% 62%, #ff6a3d 62% 70%, #0c0d0e 70%), radial-gradient(circle at 60% 30%, #ffb547, #5a3322)" },
  { href: "/splice", name: "Splice", line: "Cut shots and sound into one edit", badge: "Top", art: "linear-gradient(90deg, #2a2c30 0 24%, #0c0d0e 24% 26%, #5a3322 26% 49%, #0c0d0e 49% 51%, #ff6a3d 51% 74%, #0c0d0e 74% 76%, #ffb547 76%)" },
];

export default function ExplorePage() {
  const [recent, setRecent] = useState<Asset[]>([]);
  useEffect(() => {
    listAssets().then((a) => setRecent(a.filter((x) => x.kind !== "audio").slice(0, 8)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="max-w-2xl">
        <h1 className="font-display text-5xl uppercase leading-[0.95] sm:text-7xl">
          Make it. <span className="bg-gradient-to-r from-ember to-ember-2 bg-clip-text text-transparent">Move it.</span> Score it.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Kiln turns a sentence into an image, the image into a camera move, and your shots into a scored edit.
          Free, open models, nothing to install.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/image" className="btn-ember rounded-xl px-5 py-3 font-semibold">Start with an image</Link>
          <Link href="/video" className="rounded-xl bg-panel-2 px-5 py-3 font-medium">Animate a photo</Link>
        </div>
      </section>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="group block overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-ember/60">
              <div aria-hidden className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105" style={{ background: t.art }} />
              <div className="p-4">
                <p className="flex items-center gap-2 font-display text-2xl uppercase">{t.name}{"badge" in t && <span className={t.badge === "Top" ? "badge !bg-fg !text-bg font-sans" : "badge font-sans"}>{t.badge}</span>}</p>
                <p className="text-sm text-muted">{t.line}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-3xl uppercase">Your recent work</h2>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            Nothing yet. Everything you make is kept on this device and shows up here.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((a) => <RecentTile key={a.id} asset={a} />)}
          </ul>
        )}
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
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={url} alt={asset.prompt ?? ""} className="h-full w-full object-cover" />)}
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px]">{LABEL_TEXT[asset.label]}</span>
      </Link>
    </li>
  );
}
