# Raw discovery notes (observed, 2026-10-12, logged out unless stated)

## Landing (https://higgsfield.ai/) — logged out
- Title: "Higgsfield AI — AI-native creative suite". Dark UI, lime/yellow-green accent (#d4ff3a-ish) for CTAs and "New" badges, pink "TOP" badge.
- Top promo strip: "Get an additional discount on premium plans after signing up / Get your discount".
- Top nav (horizontal, overflows): Explore, Image, Video, Audio, MCP, API(New), Katana(New), AI Influencer(New), ChatGPT Plugin, Genjutsu(Top), Ads Studio(New), Effects, Cinema Studio, Contests, Marketing Studio, Supercomputer, 3D Jutsu(New), Edit, Academy, Community, Plugins, Canvas, Originals; right: Pricing ("30% OFF"), Enterprise, Login, Sign up.
- Hero: horizontal carousel of large video cards with uppercase title + one-line subtitle (Katana, Ads Studio: Ad Multiplier, Nano Banana 2.1, Ads Studio, AI Influencer).
- Sign-up promo card ("Sign up and get your extra discount": unlimited Nano Banana Pro, extra discount, Seedance 2.5 access) + 2x3 grid of feature tiles (icon, name, badge, one-liner): Seedance 2.5, AI Influencer, Genjutsu, MCP for Claude, Cinema Studio 4.0, Supercomputer ("Agent powered by GPT-6 Astra").
- Sections: AI Influencer banner; Film festival voting w/ countdown; "Use ChatGPT Dots with Higgsfield MCP"; VISUAL EFFECTS preset rail (Floating Fall, High Flip, Burning Man, Studio Slide, Incline, Act Natural, Eyes In, Street Colossus, Melting, Wild Ride, Cutout, World Morphing, Smash and Grab, Selfception, Lacewalker) each with "Recreate" + "View all presets".
- Genjutsu ("Reality Manipulation — transfer motion into new scenes, or swap details"); Seedance 2.5 gallery; "Explore the inside of every project — see all prompts, assets" (public projects by Higgsfield Studio); Supercomputer; GPT Image 2 gallery; Canvas ("Moodboard, chain workflows, share with team"); Marketing Studio gallery; Seedance 2.0 gallery; Photodump ("Different scenes, same star"); Soul Cinema / Soul 2.0 galleries; "Explore more AI features" tag cloud.
- Footer IA: Create (AI Video, AI Image, Edit Image, Inpaint, Upscale, Sora 2 Upscale, Mixed Media, AI Face Swap, AI Influencer, Apps); Video Models (Seedance 2.5/2.0, Kling 3.0, Sora 2, Veo 3.1, WAN 2.6, Grok Imagine 1.5, Gemini Omni Flash); Image Models (Nano Banana, Flux 2, Seedream 5, GPT Image 2, Ideogram 4.5); Studios (Cinema, Marketing, Lipsync, Photodump, Fashion Factory, Popcorn, Canvas); Soul (Soul 2.0, Soul ID Character, Soul Cinema); Platform (Supercomputer, AI Motion Designer, MCP/CLI, API, Collab, Games, Reference Extension); Resources; Company; Community.
- Key insight: Higgsfield is an aggregator/wrapper over many third-party models (Kling, Veo, Sora, Seedance, Nano Banana, Flux, GPT Image…) plus own models (Soul) and preset-driven "apps"/effects.

## Image (/ai/image → redirects to ?model=gpt_image_2) — logged out
- First paint: full black + centered lime spinner (~3-5s) → app shell.
- Rotating top promo bar (alternates "additional discount after signing up" / "Special offer: Unlimited Seedance 2.5 at 720p for 30 days. Scale plan 30% OFF"). Dismissible banner "Build your next hype machine — Create your Influencer". Small slider top-right (likely gallery/zoom size — unverified).
- Empty state: stacked illustrative image cards + "START CREATING WITH HIGGSFIELD SOUL CINEMA / Describe a scene, character, mood, or style — and watch it come to life".
- Bottom-docked composer (pill card): textarea "Describe the scene you imagine"; [+] attach; [@] reference; model chip "GPT Image 2 >"; aspect "Auto"; quality "High"; resolution "2K"; count stepper "− 1/4 +"; big lime Generate button with credit cost shown, struck-through original price (8.5 → 6.5 at High; 2.5 → 2 at Mid). Cost updates live with settings.
- Model picker: popover with search, "Featured models" then "All models"; each row icon + name + badge (PREMIUM / NEW) + one-line description. ~30 models: Higgsfield Soul 2.0, Soul Cinema, GPT Image 2.5 Sunburst/Flare, Nano Banana 2.1/Pro/2/2 Lite/standard, Seedream 5.0 Pro/Flash/lite, 4.5, 4.0, FLUX 3, Ideogram 4.5, Recraft V4.1 (+Utility, V4 Styles), Higgsfield Soul, Face Swap, Character Swap, GPT Image 1.5, GPT Image 2, Grok Imagine (+2.0), Z-Image, Kling O1…
- Aspect ratio popover: Auto (default ✓), 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, 21:9 — each w/ shape icon.
- Quality popover "Select quality": Low "Fastest and cheapest", Medium "Balanced visuals" (chip label "Mid"), High "Best visual fidelity".
- Logged-out generate: accepted prompt, cleared textarea, showed result card w/ animated pixel-mosaic + spinner → soft purple/teal gradient → blurred image behind modal "Create an account to see generated image / Sign up and generate for free / [Sign up for free] / Already have an account? Sign in", close X top-right. Whether a real image was generated server-side is UNVERIFIED. Pattern = "generate-then-gate" (let user invest effort, gate at reveal).

## Video (/ai/video → ?model=seedance_2_5) — logged out
- Same black+spinner first paint. Layout differs from Image: LEFT control panel (~340px) + RIGHT canvas/feed.
- Left panel tabs: Create Video | Edit Video | Motion Control.
- Preset card (thumbnail video): "GENERAL / Seedance 2.5" + [Change] → full-width preset overlay (URL gets &select=preset&for=motion) with model tabs (Seedance 2.5 NEW, Higgsfield Genjutsu NEW, Higgsfield Katana NEW, FLUX.3…) + Search + close X. Logged out each tab showed just "GENERAL" (preset catalog may need auth or be model-specific — unverified).
- Segmented: References | Extend Video. Dropzone "Add references — Image, Video or Audio".
- Prompt textarea: "Describe the visual change you want — e.g., 'Make it snow'… Add reference images or elements using @…"; chips: [@ Elements], [speaker On] (audio toggle).
- Model row "Seedance 2.5 >" → picker w/ search; rows show capability chips (max res, duration range, tags e.g. Edit Video/Audio). Featured: Seedance 2.5 (TOP, 1080p, 4–30s), 2.5 Draft (480p), Genjutsu, 2.5 Edit, Seedance 2.0 (4K, 4–15s)/Fast/Mini, MiniMax H3/H3 Max, Gemini Omni Flash 1.1 (+Extend), Kling 3.0 (+Motion Control), FLUX.3 Video, Grok Imagine 1.5 (+Lite), Wan 3.0. "All models" groups by family (Minimax Hailuo, FLUX.3 Video, Kling, Google Veo, Gemini Omni Flash, Higgsfield, Wan, Seedance, Grok Imagine, HappyHorse).
- Chips row: duration "5s" (→ "Choose duration" slider popover), aspect "16:9", resolution "1080p"; row "Bitrate — High >".
- Sticky Generate button, cost 80 → 60 credits (struck-through).
- Right: tabs History | How it works. How-it-works = "MAKE VIDEOS IN ONE CLICK — 250+ presets for camera control, framing, VFX" + 3 step cards (Add image / Choose preset / Get video) w/ animated demos; "Upload image … paste from clipboard"; footer "Don't know where to start? Go to the Academy".
- History tab logged out: toolbar (filter icon, size slider, List | Grid toggle) — no history content and no explicit gate observed.
- Upsell popup bottom-right "Unlimited Seedance 2.5 for 30 days with 30% off" (dismissible).

## Pricing (/pricing) — logged out
- Hero promo "EXTRA DISCOUNT — Nano Banana Pro, Nano Banana 2 & Kling 3.0 unlimited / sign up and get additional discount".
- Toggles: Individual plans | Business plans ("30-day unlimited Seedance 2.5"), "Not sure which plan?" helper, Monthly/Annual switch (Annual default).
- Plans (annual): BASIC $9/mo (120 credits ≈ 60 Nano Banana Pro gens ≈ 7 Seedance 2.0 Fast videos; parallel 2 video/2 image); PRO $23 (was $29; 600–900 credits slider; ≈300 NBP gens ≈40 Seedance 2.5 videos); MAX $59 (was $79; BEST VALUE; 1,800/3,600/5,400 credit slider); TEAMS from $65/seat (2–15 seats, pooled credits).
- Each plan lists "Free generations" per app (AI Influencer 10–30, Ads Studio 10, Genjutsu 0–3) and "Unlimited" model windows (7-day unlimited Nano Banana / Kling 3.0 on higher tiers).
- Credits are the core currency; every Generate button shows its credit price. No free plan card visible on pricing page; the image gate says "Sign up and generate for free" (free credit amount UNVERIFIED).
- Heavy, persistent promotional pressure: rotating top bar, popups, struck-through prices, discount badges on nearly every surface.

## Auth modal (Login/Sign up from nav) — logged out, nothing entered
- Fades in over current page (pricing stays dimmed behind; route unchanged).
- Split modal: LEFT auto-advancing showcase carousel w/ segmented progress bar (Seedance 4K → Nano Banana Pro 4K "best image model, for the best price in the industry" → Higgsfield Soul → Cinematic App), each w/ "4K Resolution" chip, big uppercase title.
- RIGHT: logo, "Welcome to Higgsfield / Sign up and generate for free"; highlighted CTA "Sign up with work email & Get 50 credits" (gift icon); Continue with Google / Apple / Microsoft; OR; "Work email" input (name@company.com) + Continue. Close X.
- Observed free incentive: 50 credits for work-email sign-up (other paths' free credits UNVERIFIED).
