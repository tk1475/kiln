"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; badge?: string };

const CORE: Item[] = [
  { href: "/explore", label: "Explore" },
  { href: "/image", label: "Image" },
  { href: "/video", label: "Video" },
  { href: "/audio", label: "Audio" },
  { href: "/mcp", label: "MCP" },
  { href: "/api", label: "API", badge: "New" },
];

const STUDIOS: Item[] = [
  { href: "/glaze", label: "Glaze", badge: "New" },
  { href: "/billboard", label: "Billboard", badge: "New" },
  { href: "/splice", label: "Splice", badge: "Top" },
];

function NavLink({ item, path }: { item: Item; path: string }) {
  const active = path === item.href || (path.startsWith(`${item.href}/`) && item.href !== "/api");
  return (
    <li className="shrink-0">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
          active ? "bg-fg text-bg" : "text-fg/70 hover:text-fg"
        }`}
      >
        {item.label}
        {item.badge && <span className={item.badge === "Top" ? "badge !bg-panel-2" : "badge"}>{item.badge}</span>}
      </Link>
    </li>
  );
}

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-2 overflow-x-auto px-4" aria-label="Primary">
        <Link href="/explore" className="mr-4 flex shrink-0 items-center gap-2 text-lg font-medium tracking-tight">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 2c3.6 4.6 6 7.6 6 11.6A6 6 0 0 1 6 13.6c0-2.4 1.2-4.2 2.4-5.4.4 1.9 1.4 3 2.4 3 0-3.6 0-6 1.2-9.2Z" />
          </svg>
          Kiln
        </Link>
        <ul className="flex items-center gap-0.5">{CORE.map((i) => <NavLink key={i.href} item={i} path={path} />)}</ul>
        <span aria-hidden className="mx-2 h-4 w-px shrink-0 bg-line" />
        <ul className="flex items-center gap-0.5">{STUDIOS.map((i) => <NavLink key={i.href} item={i} path={path} />)}</ul>
        <Link href="/image" className="btn-ember ml-auto hidden shrink-0 items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 md:flex">
          Start creating <span className="arrow-dot" aria-hidden>↗</span>
        </Link>
      </nav>
    </header>
  );
}
