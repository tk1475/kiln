# Implementation Plan — 24 h Higgsfield-inspired Studio

Status: **proposal, awaiting approval.** No application code exists yet.
Inputs: [`product-discovery.md`](product-discovery.md).

## 1. Recommended architecture

```
Browser (Next.js client)                                     Server (Next.js route handlers, serverless)
┌───────────────────────────────────────────┐                ┌─────────────────────────────────────────┐
│ Explore · Image · Motion · Library        │  POST /api/    │ /api/image                              │
│ Composer state (URL params + zustand)     │──generate────▶ │  validate (zod) → rate-guard            │
│ IndexedDB (Dexie): assets, blobs, prefs   │◀─ image bytes ─│  → Cloudflare Workers AI REST (FLUX)    │
│ Motion renderer: Canvas/WebGL + MediaRec. │                │  → return image/jpeg or typed error     │
└───────────────────────────────────────────┘                └─────────────────────────────────────────┘
   no DB, no auth, no queue: generation is synchronous (seconds); motion renders run fully client-side
```

One server route only — it exists to keep the provider token secret. Everything else is static/client.

## 2. Stack and justification

| Layer | Choice | Why | License / cost |
|---|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One repo for UI + secret-holding API route; first-class free hosting | MIT / $0 |
| Styling | **Tailwind CSS** + CSS variables for tokens | Fast iteration, consistent design system, dark/light | MIT / $0 |
| Primitives | **Radix UI** (Popover, Dialog, Tabs, Slider, Toggle) | Accessible popovers/dialogs with keyboard support out of the box | MIT / $0 |
| Icons | lucide-react | Consistent, tree-shaken | ISC / $0 |
| Client state | zustand (small) + URL search params | Composer state shareable via URL, like the original | MIT / $0 |
| Persistence | **Dexie** (IndexedDB) | Store generated blobs + metadata locally; no DB infra | Apache-2.0 / $0 |
| Validation | zod | Shared request/response schemas | MIT / $0 |
| Image inference | **Cloudflare Workers AI** `@cf/black-forest-labs/flux-1-schnell` via REST | Real model, documented 10k neurons/day free (~170 imgs/day est.) | Free tier; requires user's free CF account |
| Motion render | Canvas 2D (WebGL later) + `MediaRecorder` (WebM) | Real, downloadable output at $0, no server | Browser APIs |
| Tests | Vitest + Testing Library; Playwright (1 smoke flow) | Fast unit tests; one e2e on the core loop | MIT / $0 |
| Hosting | **Vercel Hobby** (CLI already installed) | Zero-config Next.js; env vars for token | $0, non-commercial |

Deliberately **not** used: database, auth provider, job queue, payment SDK, component kitchen-sink libraries, video ML models.

## 3. Routes and components

| Route | Purpose | Key components |
|---|---|---|
| `/` | Explore: hero, three tool tiles, motion preset rail, "made with this studio" samples (our own, labeled) | `ToolTile`, `PresetRail`, `SampleCard` |
| `/image` | Text→image | `Composer` (`PromptInput`, `ModelChip`, `AspectChip`, `CountStepper`, `GenerateButton` with quota cost), `ResultFeed`, `ResultCard`, `GenerationSkeleton` |
| `/motion` | Image + motion preset → video | `SourcePicker` (from library / upload / drag-drop / paste), `PresetCatalog` (masonry, previews, search, `P` shortcut), `MotionSettings` (duration, aspect, fps), `RenderProgress`, `VideoResult` |
| `/library` | All assets | `LibrarySidebar` (All, Images, Motion, Favourites; counts), `AssetGrid`, `SearchBar` (prompt + date), `Lightbox`, `EmptyState` |
| `/api/image` | Server: call provider | `route.ts`, `providers/workersAi.ts`, `providers/types.ts` |

Shared: `AppShell` (compact nav: Explore · Image · Motion · Library · quota meter), `Toast`, `ErrorState`, design tokens in `styles/tokens.css`.

## 4. Data model (IndexedDB via Dexie)

```ts
type AssetKind = 'image' | 'motion' | 'upload';

interface Asset {
  id: string;               // uuid
  kind: AssetKind;
  createdAt: number;        // epoch ms
  prompt?: string;          // image only
  model?: string;           // e.g. 'flux-1-schnell'
  provider?: 'workers-ai';  // real inference only; uploads have none
  params: { aspect: string; width: number; height: number; seed?: number; steps?: number;
            presetId?: string; durationS?: number; fps?: number };
  sourceAssetId?: string;   // motion → the image it animated
  blob: Blob;               // image/jpeg | video/webm
  thumb?: Blob;
  favourite: boolean;
  label: 'ai-generated' | 'local-render' | 'user-upload';   // always shown in UI
}

interface Job {             // in-memory only (zustand), drives loading UI
  id: string; kind: 'image' | 'motion'; status: 'queued' | 'running' | 'done' | 'error';
  progress?: number; error?: { code: ErrorCode; message: string }; assetIds: string[];
}

type ErrorCode = 'quota_exhausted' | 'provider_blocked' | 'provider_unavailable' | 'invalid_input' | 'render_failed' | 'storage_full';
```

Motion presets are static data (`presets.ts`): `{ id, name, description, previewSrc, keyframes(t) → {scale, x, y, rotate, blur} , defaultDuration }`.

## 5. Generation pipeline

**Image (real inference)**
1. Composer validates (non-empty prompt ≤ 1,000 chars, count 1–4).
2. Client creates N `Job`s, renders `GenerationSkeleton` per job immediately (staged animation: noise → gradient → reveal).
3. `POST /api/image { prompt, aspect, seed }` per image (parallel, max 2 concurrent).
4. Route: zod-validate → rate guard (per-IP soft limit + daily global cap from env) → Workers AI REST `POST /accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell` with `{ prompt, steps: 4, seed }` → returns base64 → respond `image/jpeg`.
5. Client stores blob in Dexie as `Asset{label:'ai-generated'}`, swaps skeleton for `ResultCard` with reveal transition.
6. Errors map to typed `ErrorCode` → card shows inline error + Retry.
*Open risk:* whether FLUX-schnell on Workers AI accepts width/height. If not, aspect is applied by center-crop and the UI says so (verify in M1).

**Motion (local render, labeled)**
1. User picks source image + preset + duration (3–8 s) + aspect.
2. Offscreen canvas at target size; `requestAnimationFrame` loop draws the image per preset keyframes; `canvas.captureStream(30)` → `MediaRecorder('video/webm')`.
3. Progress = elapsed / duration. Cancel supported.
4. Result blob saved as `Asset{label:'local-render', sourceAssetId}`; player + download.
5. Fallback: if `MediaRecorder` unsupported (old Safari) → show error state with explanation.

**Honesty rules (enforced in UI):** every asset card shows a label chip — "AI · FLUX schnell", "Local motion render", or "Your upload". If the provider token is missing, the Generate button is disabled with an explanation; sample images on Explore are labeled "Sample".

## 6. Error / loading / empty states

| Surface | Loading | Empty | Error |
|---|---|---|---|
| Image feed | per-image staged skeleton with elapsed time | hero + 4 clickable example prompts | inline card: message + Retry; quota → "Free daily capacity reached, resets at 00:00 UTC" |
| Motion | progress bar + live canvas preview | "Pick an image" with library/upload/paste | render failure, unsupported browser |
| Library | skeleton grid | illustration + "Generate your first image" | storage full → prompt to delete/download |
| Provider missing | — | — | banner: "Image generation is not configured" (dev only) |
| Network offline | — | — | toast + disabled Generate |

## 7. Accessibility, responsive, performance

- All chips/popovers keyboard reachable (Radix), visible focus rings, `Cmd/Ctrl+Enter` to generate, `P` opens preset catalog, `Esc` closes overlays.
- `aria-live="polite"` region announcing generation start/finish/errors.
- Respect `prefers-reduced-motion` (no autoplay previews, static skeleton).
- Layout: composer docks bottom on all widths; Motion panel stacks above canvas < 768 px; 16 px gutters; no horizontal scroll.
- Performance: no blank full-screen spinner — shell renders instantly; preset previews lazy-loaded, `preload="none"`, object URLs revoked.

## 8. Testing strategy

- **Unit (Vitest):** preset keyframe math, request schema validation, error mapping, Dexie repository (fake-indexeddb).
- **Component (Testing Library):** Composer chip changes update cost/params; GenerateButton disabled states; ResultCard actions.
- **API:** route handler with mocked provider (success, 4xx blocked, 429 quota, timeout).
- **E2E (Playwright, 1 flow):** open `/image` → type prompt → generate (provider mocked via env flag in test only) → card appears → appears in `/library` → make motion → download.
- **Manual:** real provider smoke test before deploy; keyboard-only pass; 375 px viewport pass.

## 9. Free deployment

- Vercel Hobby project from this repo; env vars `CF_ACCOUNT_ID`, `CF_API_TOKEN` (Workers AI scope only), `DAILY_IMAGE_CAP`.
- `.env.example` committed with blank values; real `.env*` already gitignored.
- No paid add-ons. If Vercel is unavailable: Cloudflare Pages + Pages Functions (same route logic).

## 10. Milestones (deployment first, then depth)

| # | Hours | Milestone | Acceptance criteria |
|---|---|---|---|
| M0 | 0–1.5 | Scaffold + deploy "hello" | Next.js+TS+Tailwind app live on Vercel URL; lint/typecheck pass; logs committed |
| M1 | 1.5–5 | **Real image vertical slice** | Prompt → real FLUX image on deployed URL; typed errors; aspect behavior verified |
| M2 | 5–9 | Composer polish + design system | Chips/popovers (model, aspect, count), staged loading, result actions (download, copy prompt, remix, delete, fav), keyboard shortcuts |
| M3 | 9–12 | Library | Dexie persistence, grid, filters, search by prompt/date, lightbox, empty state |
| M4 | 12–16 | Motion | 8–10 presets, catalog w/ previews, local render → WebM download, progress/cancel, saved to library |
| M5 | 16–19 | Explore home + nav | Home with tool tiles and preset rail (our own samples, labeled) |
| M6 | 19–22 | Quality pass | a11y keyboard pass, 375 px responsive, reduced motion, error states, tests green |
| M7 | 22–24 | Buffer + write-up | README (what's real vs local vs omitted), final deploy, logs committed |

Each milestone ends with a commit that includes the updated `.agent-logs/`.

## 11. Real / simulated / omitted

| Feature | Treatment |
|---|---|
| Text→image | **Real** (Workers AI FLUX-schnell) |
| Motion presets → video file | **Real local render** (not AI; labeled) |
| Asset library, favourites, search | **Real** (local IndexedDB) |
| Quota meter | **Real** (reflects our own daily cap, not "credits") |
| Explore samples | **Static samples** produced by our own pipeline, labeled "Sample" |
| AI video, audio, lipsync, face swap | **Omitted** |
| Accounts, payments, credits store, community | **Omitted** |
