import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "MCP — Kiln" };

export default function McpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <span className="rounded-md bg-panel-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted">Planned · not available yet</span>
      <h1 className="mt-4 font-display text-5xl uppercase">Kiln for AI assistants</h1>
      <p className="mt-3 text-muted">
        A Model Context Protocol server would let assistants like Claude call Kiln&apos;s tools directly: generate an image
        from a conversation, then hand it back for a camera move. It isn&apos;t built yet.
      </p>
      <h2 className="mt-8 text-lg font-semibold">What it would expose</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        <li><code className="text-fg">generate_image(prompt, seed?)</code> wraps the existing image endpoint</li>
        <li><code className="text-fg">list_camera_moves()</code> returns the Video presets</li>
      </ul>
      <p className="mt-8 text-sm text-muted">
        Until then, the <Link href="/api" className="text-ember underline">HTTP API</Link> covers image generation.
      </p>
    </div>
  );
}
