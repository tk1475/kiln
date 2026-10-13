"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/image", label: "Image" },
  { href: "/motion", label: "Motion" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4" aria-label="Primary">
        <Link href="/image" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="inline-block h-5 w-5 rounded-md btn-ember" />
          Kiln
        </Link>
        <ul className="flex gap-1">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
