import { TOOL_ICONS, icon3d } from "@/lib/library";

/** Shared header for tool sidebars: 3D icon, eyebrow, title and one line of help. */
export default function ToolHeader({ tool, eyebrow, title, line }: { tool: string; eyebrow: string; title: string; line: string }) {
  return (
    <header className="flex items-start gap-3">
      <img src={icon3d(TOOL_ICONS[tool])} alt="" className="h-12 w-12 shrink-0" />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-1 text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">{line}</p>
      </div>
    </header>
  );
}
