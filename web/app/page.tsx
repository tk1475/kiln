"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Asset, LABEL_TEXT, listAssets } from "@/lib/assets";
import { AspectId } from "@/lib/image";
import { CLIPS, SampleClip, TOOL_ICONS, clipPoster, clipUrl, icon3d } from "@/lib/library";
import { useObjectUrl } from "@/components/useObjectUrl";
import BlurText from "@/components/reactbits/BlurText";
import Spotlight from "@/components/Spotlight";
import PromptDock from "@/components/PromptDock";

const TOOLS = [
  { key: "image", href: "/image", name: "Image", line: "Text to image" },
  { key: "video", href: "/video", name: "Video", line: "Camera moves" },
  { key: "audio", href: "/audio", name: "Audio", line: "Mood beds" },
  { key: "glaze", href: "/glaze", name: "Glaze", line: "Film and VHS looks" },
  { key: "billboard", href: "/billboard", name: "Billboard", line: "Image to ad" },
  { key: "splice", href: "/splice", name: "Splice", line: "Cut one edit" },
];

const HERO = ["a-7", "u-2", "l-4", "u-3", "s2-2"].map((id) => CLIPS.find((c) => c.id === id)!);
const HERO_MS = 6000;
const REEL = ["u-2", "r-2", "a-6", "s2-2", "r-3", "l-4"].map((id) => CLIPS.find((c) => c.id === id)!);

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectId>("1:1");
  const [count, setCount] = useState(1);
  const [recent, setRecent] = useState<Asset[]>([]);

  useEffect(() => {
    listAssets().then((a) => setRecent(a.filter((x) => x.kind !== "audio" && x.label !== "sample").slice(0, 6)));
  }, []);

  const submit = () => {
    const p = prompt.trim();
    if (!p) return;
    router.push(`/image?${new URLSearchParams({ prompt: p, aspect, count: String(count), go: "1" })}`);
  };

  return (
    <div className="w-full pb-44">
      <section className="relative -mt-16 h-[calc(58svh+4rem)] min-h-[440px] max-h-[700px] w-full overflow-hidden">
        <HeroReel clips={HERO} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 text-white sm:pb-14">
          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)]">
            <BlurText text="Make it, move it," animateBy="words" delay={90} />
            <BlurText text="score it." animateBy="words" delay={90} className="text-white/60" />
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
            Generate an image, give it a camera move, score it and cut it into one edit. Open models and on-device rendering.
          </p>
        </div>
        <span className="absolute bottom-3 right-4 z-10 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] text-white/80">Sample clips</span>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <section className="mt-14" aria-labelledby="studios">
          <p id="studios" className="eyebrow">Studios</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TOOLS.map((t) => (
              <li key={t.key}>
                <Link href={t.href} className="group block h-full rounded-3xl">
                  <Spotlight className="h-full">
                    <img src={icon3d(TOOL_ICONS[t.key])} alt="" className="h-10 w-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-6" />
                    <p className="mt-6 font-medium tracking-tight">{t.name}</p>
                    <p className="text-xs text-muted">{t.line}</p>
                  </Spotlight>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recent.length > 0 && (
          <section className="mt-14" aria-labelledby="recent">
            <p id="recent" className="eyebrow">Your recent work</p>
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {recent.map((a) => <RecentTile key={a.id} asset={a} />)}
            </ul>
          </section>
        )}

        <section className="mt-14" aria-labelledby="reel">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p id="reel" className="eyebrow">Sample clips</p>
              <p className="mt-2 text-sm text-muted">Reference footage from the asset library, ready to cut in Splice. Not made by Kiln.</p>
            </div>
            <Link href="/splice" className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-ember-2 hover:underline">Open Splice ↗</Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {REEL.map((c) => <ClipTile key={`${c.set}/${c.id}`} clip={c} />)}
          </ul>
        </section>
      </div>

      <PromptDock prompt={prompt} setPrompt={setPrompt} aspect={aspect} setAspect={setAspect} count={count} setCount={setCount}
        onSubmit={submit} canSubmit={prompt.trim().length > 0} />
    </div>
  );
}

/** Crossfades through several sample clips behind the headline. Paused and static under reduced motion. */
function HeroReel({ clips }: { clips: SampleClip[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      refs.current.forEach((v) => v?.pause());
      return;
    }
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
    });
    const t = setTimeout(() => setActive((a) => (a + 1) % clips.length), HERO_MS);
    return () => clearTimeout(t);
  }, [active, clips.length]);

  return (
    <>
      {clips.map((c, i) => (
        <video
          key={c.id}
          ref={(el) => { refs.current[i] = el; }}
          src={clipUrl(c)}
          poster={clipPoster(c)}
          muted
          loop
          playsInline
          preload={i === active || i === (active + 1) % clips.length ? "auto" : "none"}
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Hero clips">
        {clips.map((c, i) => (
          <button key={c.id} role="tab" aria-selected={i === active} aria-label={`Show clip ${i + 1}`} onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`} />
        ))}
      </div>
    </>
  );
}

function ClipTile({ clip }: { clip: SampleClip }) {
  const ref = useRef<HTMLVideoElement>(null);
  const play = () => ref.current?.play().catch(() => {});
  const stop = () => { const v = ref.current; if (v) { v.pause(); v.currentTime = 0; } };
  return (
    <li className="group relative aspect-video overflow-hidden rounded-3xl bg-panel" onMouseEnter={play} onMouseLeave={stop}>
      <Image src={clipPoster(clip)} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
      <video ref={ref} src={clipUrl(clip)} muted loop playsInline preload="none" aria-label="Sample clip"
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <button onFocus={play} onBlur={stop} className="absolute inset-0" aria-label="Play sample clip preview" />
    </li>
  );
}

function RecentTile({ asset }: { asset: Asset }) {
  const url = useObjectUrl(asset.blob);
  const href = asset.kind === "image" ? `/video?src=${asset.id}` : `/splice?add=${asset.id}`;
  return (
    <li>
      <Link href={href} className="relative block aspect-square overflow-hidden rounded-2xl bg-panel">
        {url && (asset.kind === "motion"
          ? <video src={`${url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />
          : <img src={url} alt={asset.prompt ?? ""} className="h-full w-full object-cover" />)}
        <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">{LABEL_TEXT[asset.label]}</span>
      </Link>
    </li>
  );
}
