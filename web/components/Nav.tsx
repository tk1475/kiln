"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/image", label: "Image" },
  { href: "/video", label: "Video" },
  { href: "/audio", label: "Audio" },
  { href: "/mcp", label: "MCP" },
  { href: "/api", label: "API", badge: "New" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="flex h-14 items-center gap-2 overflow-x-auto px-4 sm:gap-4" aria-label="Primary">
        <Link href="/explore" aria-label="Kiln home" className="mr-2 shrink-0">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-fg text-bg">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 3c3 4 5 6.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3 0-5 1-8Z" />
            </svg>
          </span>
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href) && !(l.href === "/api" && path.startsWith("/api/"));
            return (
              <li key={l.href} className="shrink-0">
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[15px] font-medium transition-colors ${
                    active ? "text-fg" : "text-muted/80 hover:text-fg"
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="rounded-md bg-ember/20 px-1.5 py-0.5 text-[11px] font-semibold text-ember-2">{l.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <span aria-hidden className="ml-1 hidden h-5 w-px bg-line sm:block" />
      </nav>
    </header>
  );
}
