"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Asset, LABEL_TEXT, listAssets } from "@/lib/assets";
import { AspectId } from "@/lib/image";
import { CLIPS, SAMPLES, SampleClip, TOOL_ICONS, clipKey, clipPoster, clipUrl, icon3d, libraryUrl } from "@/lib/library";
import { useObjectUrl } from "@/components/useObjectUrl";
import BlurText from "@/components/reactbits/BlurText";
import PromptDock from "@/components/PromptDock";

type Card = { key: string; href: string; title: [string, string]; bg: string; ink: string; cta: string };

/** Feature cards: tinted gradient, two-line title, CTA bottom-left, oversized 3D icon bleeding off the right edge. */
const TOOLS: Card[] = [
  { key: "image", href: "/image", title: ["Text to", "Image"], bg: "linear-gradient(135deg,#0f1b2e 0%,#1d3557 100%)", ink: "#ffffff", cta: "#8fb2ff" },
  { key: "video", href: "/video", title: ["Camera", "Moves"], bg: "linear-gradient(135deg,#a9c8de 0%,#5f8fb0 100%)", ink: "#0e1a26", cta: "#0e1a26" },
  { key: "audio", href: "/audio", title: ["Mood", "Soundtracks"], bg: "linear-gradient(135deg,#2f6bff 0%,#79a3ff 100%)", ink: "#ffffff", cta: "#e6eeff" },
  { key: "glaze", href: "/glaze", title: ["Glaze", "Looks"], bg: "linear-gradient(135deg,#0d0f12 0%,#1c2733 100%)", ink: "#ffffff", cta: "#8fb2ff" },
  { key: "billboard", href: "/billboard", title: ["Billboard", "Ads"], bg: "linear-gradient(135deg,#e4edf7 0%,#b7cde6 100%)", ink: "#0e1a26", cta: "#1f4fd6" },
  { key: "splice", href: "/splice", title: ["Splice", "Edits"], bg: "linear-gradient(135deg,#132a6b 0%,#2f6bff 100%)", ink: "#ffffff", cta: "#cfdcff" },
];

type Recreate = { key: string; poster: string; video?: string; href: string; action: string; tag: string };

/** Sample assets with a one-tap path to recreate them in a studio. */
const RECREATE: Recreate[] = [
  ...(["r-2", "u-2", "a-6", "r-1"] as const).map((id) => {
    const c = CLIPS.find((x) => x.id === id)!;
    return { key: clipKey(c), poster: clipPoster(c), video: clipUrl(c), href: `/splice?clip=${clipKey(c)}`, action: "Cut in Splice", tag: "Sample clip" };
  }),
  { key: "s-anim", poster: libraryUrl(SAMPLES[4]), href: `/video?sample=${SAMPLES[4]}`, action: "Animate", tag: "Sample image" },
  { key: "s-ad", poster: libraryUrl(SAMPLES[0]), href: `/billboard?sample=${SAMPLES[0]}`, action: "Make an ad", tag: "Sample image" },
  { key: "s-glaze", poster: libraryUrl(SAMPLES[8]), href: `/glaze?sample=${SAMPLES[8]}`, action: "Glaze it", tag: "Sample image" },
  { key: "s-anim2", poster: libraryUrl(SAMPLES[12]), href: `/video?sample=${SAMPLES[12]}`, action: "Animate", tag: "Sample image" },
];

const HERO = ["a-7", "u-2", "l-4", "u-3", "s2-2"].map((id) => CLIPS.find((c) => c.id === id)!);
const HERO_MS = 6000;

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
    <div className="w-full">
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
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => <FeatureCard key={t.key} card={t} />)}
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

        <section className="mt-14" aria-labelledby="recreate">
          <p id="recreate" className="eyebrow">Recreate</p>
          <p className="mt-2 max-w-xl text-sm text-muted">Start from a sample from the asset library and open it in the right studio. Samples are reference material, not Kiln output.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {RECREATE.map((r) => <RecreateTile key={r.key} item={r} />)}
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

function FeatureCard({ card }: { card: Card }) {
  return (
    <li>
      <Link href={card.href} className="group relative flex aspect-[2/1] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
        style={{ background: card.bg, color: card.ink }}>
        <h3 className="relative z-10 text-2xl font-medium leading-tight tracking-tight sm:text-[1.7rem]">
          {card.title[0]}<br />{card.title[1]}
        </h3>
        <span className="relative z-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: card.cta }}>
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span> Open studio
        </span>
        <img src={icon3d(TOOL_ICONS[card.key])} alt="" aria-hidden
          className="pointer-events-none absolute -bottom-[14%] -right-[6%] h-[115%] w-auto rotate-[-8deg] drop-shadow-2xl transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-[-2deg] group-hover:scale-105" />
      </Link>
    </li>
  );
}

function RecreateTile({ item }: { item: Recreate }) {
  const ref = useRef<HTMLVideoElement>(null);
  const play = () => ref.current?.play().catch(() => {});
  const stop = () => { const v = ref.current; if (v) { v.pause(); v.currentTime = 0; } };
  return (
    <li className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-panel" onMouseEnter={play} onMouseLeave={stop}>
      <Image src={item.poster} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      {item.video && (
        <video ref={ref} src={item.video} muted loop playsInline preload="none" aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white backdrop-blur">{item.tag}</span>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <Link href={item.href} onFocus={play} onBlur={stop}
          className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-3 pr-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#101114] backdrop-blur transition-colors hover:bg-ember hover:text-on-ember">
          Recreate · {item.action}
          <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-[#101114] text-white">↗</span>
        </Link>
      </div>
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
