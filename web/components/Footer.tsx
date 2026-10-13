import Link from "next/link";

const COLUMNS = [
  { title: "Studios", links: [["Image", "/image"], ["Video", "/video"], ["Audio", "/audio"], ["Glaze", "/glaze"], ["Billboard", "/billboard"], ["Splice", "/splice"]] },
  { title: "Build", links: [["API", "/api"], ["MCP", "/mcp"], ["Source on GitHub", "https://github.com/tk1475/kiln"]] },
] as const;

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-medium tracking-tight">
            <img src="/brand/kiln-mark.png" alt="" width={22} height={22} className="brand-mark h-[22px] w-[22px]" />
            Kiln
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Image, video and audio studio. Images come from FLUX.1 schnell; motion, looks, ads, sound and edits render on your device.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="eyebrow text-muted">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  {href.startsWith("http")
                    ? <a href={href} target="_blank" rel="noreferrer" className="text-muted hover:text-fg">{label} ↗</a>
                    : <Link href={href} className="text-muted hover:text-fg">{label}</Link>}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-line px-4 py-5 text-[11px] text-muted">
        <span>© 2026 Kiln. Sample images, clips and 3D icons from the ImagineArt asset library.</span>
        <span>UI components from <a href="https://reactbits.dev" target="_blank" rel="noreferrer" className="underline">React Bits</a>.</span>
      </div>
    </footer>
  );
}
