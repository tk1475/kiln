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
  const active = path === item.href || path.startsWith(`${item.href}/`) && item.href !== "/api";
  return (
    <li className="shrink-0">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[15px] font-medium transition-colors ${
          active ? "text-fg" : "text-muted hover:text-fg"
        }`}
      >
        {item.label}
        {item.badge && <span className={item.badge === "Top" ? "badge !bg-fg !text-bg" : "badge"}>{item.badge}</span>}
      </Link>
    </li>
  );
}

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="flex h-14 items-center gap-2 overflow-x-auto px-4" aria-label="Primary">
        <Link href="/explore" aria-label="Kiln home" className="mr-3 shrink-0">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-fg text-bg">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 3c3 4 5 6.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3 0-5 1-8Z" />
            </svg>
          </span>
        </Link>
        <ul className="flex items-center gap-1">{CORE.map((i) => <NavLink key={i.href} item={i} path={path} />)}</ul>
        <span aria-hidden className="mx-2 h-5 w-px shrink-0 bg-line" />
        <ul className="flex items-center gap-1">{STUDIOS.map((i) => <NavLink key={i.href} item={i} path={path} />)}</ul>
      </nav>
    </header>
  );
}
