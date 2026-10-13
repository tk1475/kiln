"use client";

const KEY = "kiln-theme";

/** Applies a saved theme before first paint; without one, the system preference wins. */
export const themeScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch {}
  };
  return (
    <button onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-panel text-fg transition-colors hover:bg-panel-2">
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
      </svg>
    </button>
  );
}
