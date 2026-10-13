# Product Discovery — Higgsfield AI

**Explored:** 2026-10-12 → 2026-10-13, desktop Chrome, ~1440–1570 px wide.
**Method:** Claude in Chrome browser automation (screenshots + DOM text reads). Signed-out pass first, then a signed-in pass on a fresh account (user performed Google OAuth and the Cloudflare human check).
**Raw notes:** [`docs/reference/notes-raw.md`](reference/notes-raw.md). **Screenshots:** [`docs/reference/`](reference/) (account-identifying shots in `docs/reference/private/`, gitignored).

Legend used throughout:

| Tag | Meaning |
|---|---|
| **OBSERVED** | Seen directly in this session, screenshot or DOM text exists |
| **UNVERIFIED** | Implied by copy/UI but not exercised or confirmed |
| **INACCESSIBLE** | Not reached: needs credits, paid plan, content we don't have, or out of time |
| **HYPOTHESIS** | Our inference about internals; not observable from the client |

---

## 1. Product overview

Higgsfield is an **AI-native creative suite** ("AI Video & Image Generator") that wraps dozens of third-party generative models (Kling, Veo, Sora, Seedance, Nano Banana, FLUX, GPT Image, Seedream, Grok Imagine, Wan, MiniMax…) plus its own models (Higgsfield Soul, Genjutsu, Katana) behind one credit-metered UI. On top of the raw generators it layers **preset-driven "apps"** (Visual Effects, AI Influencer, Ads Studio, Photodump, Cinema Studio…) where the user supplies an image and picks a named effect instead of writing a prompt. A community layer (public profiles, galleries, likes, contests, a film festival) feeds discovery.

The core loop we observed: **pick a tool → pick model/preset → provide prompt and/or reference image → see live credit cost → Generate → result card in the same workspace → assets accumulate in a library.**

## 2. Information architecture (OBSERVED)

```
Top nav (horizontal, overflows): Explore · Image · Video · Audio · MCP · API · Katana · AI Influencer ·
  ChatGPT Plugin · Genjutsu · Ads Studio · Effects · Cinema Studio · Contests · Marketing Studio ·
  Supercomputer · 3D Jutsu · Edit · Academy · Community · Plugins · Canvas · Originals
Right: [Search]* · Pricing (discount badge) · Enterprise · [Assets]* · Login/Sign up | [Avatar]*      (* signed-in only)

/                     Explore / marketing home (feature tiles, preset rails, community galleries)
/ai/image?model=…     Image generator (bottom composer)
/ai/video?model=…     Video generator (left control panel + right canvas; &select=preset overlay)
/effects/use          Preset-first VFX generator
/pricing              Plans (Individual | Business; Monthly | Annual)
/assets               Asset library (Assets, Projects, Favourites, Elements; Tools: Images, Video, Audio, Enhanced)
/@<handle>            Public profile (All works, Projects, Shots, Blog, Achievements)
/auth/sso-callback    OAuth return + Cloudflare Turnstile
Footer: Create · Video Models · Image Models · Studios · Soul · Platform · Resources · Company · Community
```

The model selection lives in the **URL query** (`?model=gpt_image_2`, `?model=seedance_2_5`), so model choice is shareable/deep-linkable.

## 3. Observed end-to-end journeys

### J1. Landing → explore (signed out) — OBSERVED
1. **Goal:** understand what the product can do. **Entry:** `/`.
2. **Steps:** promo bar → hero carousel of large autoplay video cards (title + one-liner) → sign-up promo card + 2×3 feature tiles → preset rails ("Recreate" buttons) → community galleries (masonry, creator handle + like count) → footer sitemap.
3. **Inputs/outputs:** none / navigation.
4. **States:** gallery tiles render as grey skeletons until lazy media loads (`05-landing-seedance-skeletons.jpg`). Cookie banner appears after first scroll (we chose **Dismiss**).
5. **UI patterns:** dark canvas, lime accent CTAs, all-caps condensed display type, NEW/TOP/PREMIUM badges, video-first cards.
6. **Friction:** extremely dense nav (25+ items, overflows), constant promo pressure, mouse-wheel didn't scroll the page via automation (custom scroll handling — HYPOTHESIS).
7. **$0 feasibility:** high — static marketing page with our own sample media.

### J2. Image generation (signed out → gate) — OBSERVED
1. **Goal:** make an image from text. **Entry:** nav "Image" → `/ai/image` (redirects to `?model=gpt_image_2`).
2. **Steps:** full-screen black + lime spinner (~3–5 s) → empty state hero ("Start creating with Higgsfield Soul Cinema") → bottom composer: prompt, `+` attach, `@` reference, model chip, aspect (Auto, 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, 21:9), quality (Low/Medium/High), resolution (2K), count stepper (1/4), Generate with credit price (struck-through "original" price beside it).
3. **Inputs:** prompt (+ optional references). **Outputs:** result card in the canvas above the composer.
4. **States:** after Generate → prompt clears → result card with animated **pixel-mosaic + spinner** → soft gradient placeholder → **blurred result behind "Create an account to see generated image / Sign up for free / Sign in"** modal. Whether a real image was produced server-side: **UNVERIFIED**.
5. **UI patterns:** popovers anchored to composer chips; searchable model picker with Featured/All sections; live price recompute (High 8.5→6.5, Mid 2.5→2).
6. **Friction:** gate appears only *after* the user invests effort ("generate-then-gate"); price shown as decimal credits with fake-feeling discount strikes.
7. **$0 feasibility:** high for the composer UX; real inference needs a free-tier provider (see §9).

### J3. Video generation setup — OBSERVED (no generation run)
1. **Goal:** animate an image / make a clip. **Entry:** nav "Video" → `/ai/video?model=seedance_2_5`.
2. **Steps:** left panel: tabs Create Video / Edit Video / Motion Control → preset card ("GENERAL · Seedance 2.5", Change) → References | Extend Video → dropzone (image, video or audio) → prompt with `@ Elements` and audio On toggle → Model row → chips duration (slider popover), aspect, resolution → Bitrate → sticky Generate (80→60 credits). Right: History | How it works (3-step explainer: Add image → Choose preset → Get video).
3. **Preset overlay:** full-width, tabs per model family + Search; for Seedance 2.5/FLUX.3 only "GENERAL" was present (signed in and out).
4. **Model picker:** each row shows capability chips (max resolution, duration range, Edit/Audio tags). ~17 featured + grouped "All models".
5. **States:** spinner first paint; upsell popup bottom-right; History tab shows toolbar (filter, size slider, List/Grid) and no content.
6. **Friction:** two different generator layouts (Image = bottom composer, Video = left panel) for similar jobs; video controls below the fold on a 732 px viewport.
7. **$0 feasibility:** UX high; *real* AI video at $0 is not realistic (see §9) — we can do honest client-side motion renders.

### J4. Preset-first effect generation — OBSERVED (no generation run)
1. **Goal:** apply a named viral effect to my photo without prompting. **Entry:** `/effects/use` (nav "Effects", landing "Recreate").
2. **Steps:** preset card (e.g. "FLOATING FALL", Change / `P` shortcut) → slots: Character (required), Location (optional), Products (optional) → hidden prompt toggle → 720p · 9:16 → Generate (84 credits) / "Try in ChatGPT".
3. **Catalog:** masonry of autoplay preview videos, label bottom-left, lime border + check on selection, search, Effects | History.
4. **$0 feasibility:** high for catalog + slot UX; output = honest local motion/compositing render.

### J5. Sign-up / sign-in — OBSERVED (performed by user)
1. **Entry:** Login / Sign up / generation gate. Modal over current page: left auto-advancing showcase carousel with segmented progress bar; right "Welcome to Higgsfield — Sign up and generate for free", "Sign up with work email & Get 50 credits", Google / Apple / Microsoft, email field.
2. **Flow:** Google OAuth → `/auth/sso-callback?rp=/pricing` → **Cloudflare Turnstile** → back to the originating page.
3. **Onboarding:** none observed beyond landing back on Pricing with a **personal 50% countdown offer** and a **$0 3-day trial (150 credits) → $49/mo Plus** upsell. No tutorial, no profile setup wizard.

### J6. Assets / history — OBSERVED (empty account)
- `/assets`: sidebar with counts (Assets, Projects, Favourites, Elements; Tools: Images, Video, Audio, Enhanced), illustrated empty state + "Start generating", "search by date and prompt" tooltip. Logged-out generation did **not** carry over.
- Populated grid, preview, download, regenerate, edit, favourite: **INACCESSIBLE** (no generations in account; spending credits not approved).

### J7. Pricing & credits — OBSERVED
- Credit currency everywhere; every Generate shows cost. Plans (annual): Basic $9 (120 cr), Pro $23 (600–900 cr), Max $59 (1,800–5,400 cr), Teams from $65/seat. Per-app "free generations", time-boxed "unlimited" windows, parallel-generation limits.
- Credit **balance** display: not found on generator pages. Profile shows "◆ 0" (credits or level — UNVERIFIED).
- Out-of-credits / upgrade modal on Generate: **INACCESSIBLE** (not triggered).

## 4. Feature inventory

| Area | Feature | Status |
|---|---|---|
| Nav/IA | Overflowing top nav, badges, footer sitemap | OBSERVED |
| Explore | Hero video carousel, feature tiles, preset rails, community galleries, lazy skeletons | OBSERVED |
| Image | Bottom composer, model picker (~30, search, badges), aspect/quality/res/count, live credit price | OBSERVED |
| Image | `+` attach and `@` reference flows | UNVERIFIED (not opened) |
| Image | Loading mosaic → gradient → blurred result + sign-up gate (signed out) | OBSERVED |
| Image | Actual result view, download, regenerate, upscale, edit | INACCESSIBLE |
| Video | Left panel tabs, preset card + overlay, references dropzone, Elements/audio toggles, model picker w/ capability chips, duration slider, aspect, res, bitrate | OBSERVED |
| Video | Edit Video, Motion Control, Extend Video tabs | UNVERIFIED (not opened) |
| Video | Generation progress, result player, history items | INACCESSIBLE |
| Effects | Preset-first slots, masonry preset catalog, `P` shortcut | OBSERVED |
| Auth | Modal, OAuth, Turnstile, work-email 50 credits | OBSERVED |
| Onboarding | Personal countdown discount, $0 trial upsell | OBSERVED |
| Assets | Library sidebar + empty state | OBSERVED |
| Assets | Populated grid, favourites, projects, elements | INACCESSIBLE |
| Profile | Public profile, stats, tabs, publish/create | OBSERVED |
| Pricing | Plans, toggles, sliders, free-gen and unlimited tables | OBSERVED |
| Errors | Failed generation, moderation block, out of credits | INACCESSIBLE |
| Responsive | Mobile layout | INACCESSIBLE (window resize had no effect via automation) |
| Other apps | Audio, Katana, Genjutsu, Ads Studio, Canvas, Cinema Studio, Supercomputer, MCP, API, Community, Contests | Not explored (out of MVP scope) |

## 5. Screenshot index (`docs/reference/`)

| File | Shows |
|---|---|
| 01-landing-hero.jpg | Nav, hero carousel |
| 02-landing-cookie-banner.jpg | Promo bar, cookie notice |
| 03-landing-festival-grid-lazyload.jpg | Festival grid, lazy tiles |
| 04-landing-visual-effects.jpg | VFX preset rail |
| 05-landing-seedance-skeletons.jpg | Skeleton loading |
| 06-landing-gpt-image-gallery.jpg | Community gallery |
| 10-image-initial-spinner.jpg | First-paint spinner |
| 11-image-composer-empty.jpg | Image empty state + composer |
| 12-image-model-picker.jpg | Model picker |
| 13-image-aspect-ratio.jpg | Aspect popover |
| 14-image-quality.jpg | Quality popover |
| 15-image-gen-loading-mosaic.jpg | Loading: mosaic |
| 16-image-gen-loading-gradient.jpg | Loading: gradient |
| 17-image-gen-signup-gate.jpg | Post-generate sign-up gate |
| 20-video-create-panel-upsell.jpg | Video panel + upsell popup |
| 21-video-preset-library.jpg | Preset overlay |
| 22-video-controls.jpg | Video controls |
| 23-video-duration-slider.jpg | Duration popover |
| 24-video-model-picker.jpg | Video model picker w/ capability chips |
| 25-video-history-loggedout.jpg | History toolbar |
| 30-pricing.jpg | Pricing (signed out) |
| 31-auth-modal.jpg | Sign-up modal |
| 40-auth-pricing-personal-offer.jpg | Signed-in pricing, countdown, trial |
| 42-auth-assets-empty.jpg | Assets empty state |
| 43-auth-image-composer.jpg | Signed-in image page |
| 44-auth-video-presets.jpg | Signed-in preset overlay |
| 45-auth-effects-preset-first.jpg | Effects generator |
| 46-auth-effects-catalog.jpg | Effects catalog |
| private/41-auth-profile.jpg | Profile (contains name — not committed) |

## 6. Core user jobs & value proposition

1. **"Make something that looks expensive, fast."** Cinematic image/video without production skills.
2. **"Use the trending effect on my own photo."** Preset-first, zero-prompt virality (Effects, Photodump, AI Influencer).
3. **"Try the newest model without five subscriptions."** One wallet, many models, model picker with capability chips.
4. **"Keep my stuff and my character consistent."** Assets, Elements (`@` references), Projects.

Value proposition: *one creative workspace and one credit wallet over every frontier model, with presets that turn prompting into picking.*

## 7. UX strengths and friction

**Strengths (worth reproducing)**
- Single, always-visible composer; every parameter is a compact chip that opens a focused popover.
- **Live cost on the Generate button** — price is part of the decision, not a surprise.
- Model picker as a searchable catalog with capability chips (res, duration, tags).
- Preset catalog as autoplaying visual examples — users pick outcomes, not prompts.
- Distinct, staged loading animation (mosaic → gradient → reveal) makes waiting feel intentional.
- Good empty states (illustration + one CTA), model in URL, keyboard shortcut for presets.

**Friction (where we can be better)**
- Overloaded nav (25+ items) and two inconsistent generator layouts.
- Aggressive monetisation: rotating promo bars, popups, countdowns, struck-through prices on every surface.
- Generate-then-gate: user's effort is held hostage behind sign-up.
- Credit balance not visible where you spend it.
- 3–5 s blank spinner on every generator route.
- Several presets/tabs show a single "GENERAL" option — empty-feeling catalog per model.

## 8. Likely technical architecture (HYPOTHESES)

- **Frontend:** React SPA/SSR hybrid (Next.js-style routes, query-param state, client-heavy generator shells → long spinner). Video previews served as short MP4/WebM from a CDN with lazy loading.
- **Auth:** OAuth (Google/Apple/Microsoft) via a hosted identity provider (`/auth/sso-callback` naming suggests Clerk-style SSO — unverified), Cloudflare in front (Turnstile observed).
- **Generation:** async job queue — client posts a job, polls/streams status, result written to object storage; credits debited per job; a model-routing layer maps UI models to third-party APIs (Kling, Veo, Seedance via BytePlus, etc.) and in-house models on GPU clusters.
- **Assets:** per-user asset table (type, model, prompt, params, URL, timestamps) with search by date/prompt.
- **Growth:** experiment-driven pricing (personal timed discounts, trial upsells) — likely feature-flag/AB platform.

## 9. Open-source / $0 implementation options

| Need | Option | Cost / limits | Notes |
|---|---|---|---|
| Real text→image | **Cloudflare Workers AI** (`@cf/black-forest-labs/flux-1-schnell`, FLUX.2 klein) | Free 10,000 neurons/day (documented). FLUX-1-schnell: 4.8 neurons/512² tile + 9.6/step ⇒ ~58 neurons per 1024² 4-step image ⇒ **~170 images/day** (our arithmetic) | Needs a free Cloudflare account + API token (user must create). Server-side call. Recommended. |
| Real text→image (alt) | Pollinations (`gen.pollinations.ai`) | Free tier exists but **now requires a key** (sign-up) | MIT repo; anonymous use no longer documented. Fallback. |
| Real text→image (alt) | Hugging Face Inference Providers | Small monthly free credit (amount unverified) | Fallback. |
| Image→"video" | **Client-side motion render**: Canvas 2D/WebGL camera moves (push-in, pan, orbit-parallax, shake, zoom-blur) recorded with `MediaRecorder` / WebCodecs → WebM/MP4 | $0, runs in browser | Honest: labeled "Motion render (local)", not AI video. Mirrors Higgsfield's camera-control presets. |
| Real AI video | Free hosted video inference | **No reliable $0 option found** | Omit or BYO-key later. |
| Storage / history | IndexedDB (Dexie, Apache-2.0) | $0, per browser | No backend DB needed. |
| UI | Next.js (MIT), React, Tailwind (MIT), Radix primitives (MIT), lucide icons (ISC) | $0 | |
| Hosting | Vercel Hobby or Cloudflare Pages | $0 | Vercel Hobby is non-commercial use only. |

## 10. Free-tier constraints and risks

- **Daily neuron cap**: a demo with many reviewers could exhaust ~170 images/day → need per-session rate limit, graceful "daily free capacity reached" state, and cached sample outputs clearly labeled as samples.
- **Provider account**: requires the user to create a Cloudflare account and token (we cannot create accounts). Token must live in env vars, never in the repo.
- **Function timeouts**: FLUX-schnell is fast (seconds), fits serverless limits; anything slower must be async.
- **No real AI video** at $0 — must be explicit in UI and in the write-up.
- **Content safety**: free providers may refuse prompts; we need a clear "blocked by provider" error state.
- **Local-only history**: assets vanish if the user clears storage; no cross-device sync.

## 11. Proposed MVP scope (24 h)

A focused, coherent **"Studio" with three tools sharing one composer, one asset library, and one design system**:

1. **Image** — real text→image via Workers AI (FLUX-schnell), model/aspect/count chips, live "cost" shown as free-quota units, staged loading, result card actions (download, copy prompt, remix, delete, favourite).
2. **Motion** — pick an image (generated or uploaded) + a **motion preset** from a visual catalog → real client-side render to WebM/MP4 with progress → download. Labeled as local motion render.
3. **Library** — IndexedDB-backed assets grid with filters (Images / Motion / Favourites), search by prompt and date, preview lightbox, empty state.
4. **Explore** home — preset rails using *our own* sample outputs, entry points into the three tools.

## 12. Intentionally deferred

Auth/accounts, payments/credits purchase, community/profiles/likes/contests, AI video models, audio, lipsync, face/character swap, inpaint/upscale, projects/elements, multi-user teams, MCP/API, Canvas, ChatGPT plugin, i18n.

## 13. Questions for you

1. **Credits:** may I spend credits on one real Higgsfield image generation to document the result view and actions? (Still unanswered — currently documented as INACCESSIBLE.)
2. **Inference provider:** will you create a free Cloudflare account + Workers AI API token (I can't create accounts)? Without it, Image generation can only run as a clearly-labeled sample mode.
3. **Video:** accept honest **local motion renders** instead of AI video, or omit video entirely?
4. **Hosting:** deploy on Vercel Hobby (CLI is installed; are you logged in?) or Cloudflare Pages?
5. **Product name / visual direction:** any name you want, or shall I propose one with its own palette (not lime-on-black)?
