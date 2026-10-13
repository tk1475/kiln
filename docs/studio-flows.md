# Kiln studio flows and sample-asset plan

Status: analysis and proposals, 2026-10-13. Based on the code in `web/app/*/page.tsx`, `web/lib/*.ts` and
`web/components/SourcePicker.tsx`, plus `docs/product-discovery.md` and `docs/reference/notes-raw.md` for Higgsfield.
Anything under "Proposed" does not exist in the code yet.

**Labelling rule for everything below.** Every library asset is reference material from the ImagineArt asset library
(`cdn-imagine.vyro.ai/everask-lp-assets`), approved for use. It is never Kiln output and must carry a visible
"Sample" / "Sample clip" label wherever it appears. Only FLUX.1 schnell results may be called AI output. Video, Audio,
Glaze, Billboard and Splice results are on-device renders and must keep saying so.

ID convention: stills are written as their `SAMPLES` name with the hash shortened to 4 characters (`ex1-0c2b` =
`ex1-0c2bbc4f`). Clips are written as `set/id` with `sd` = `cinema-seedance`, `sd2` = `cinema-seedance-2`, `kling` =
`models-kling`. The still `b-6-1a39` (balloon and chair) and the clip `kling/b-6` (serum bottle) are different assets.

## 1. Asset inventory

No public bucket listing exists: the CDN root returns 403, so this inventory covers only what `lib/library.ts` lists.

### Product and packshot
| Asset | Type, aspect | Content |
|---|---|---|
| `kling/b-6` | clip 1:1 | Amber serum dropper bottle on wet rock, warm spotlight |
| `kling/b-7` | clip 1:1 | Same style of serum bottle splashing into blue water |
| `kling/r-2` | clip 16:9 | Tan leather backpack on white |
| `sd/a-2` | clip 16:9 | Floating shoe, dark studio |
| `sd2/s2-2` | clip 16:9 | Glossy black helmet |
| `sd/u-2` | clip 16:9 | Black faceted gem on a reflective floor |
| `showcase-5-a57e` | still 4:3 | White sneaker in a water splash |
| `b-4-0599` | still 4:3 | "MAREA" bottles and boxes on stone (baked-in brand text) |
| `ex2-1558` | still 3:4 | Cream handbag on a plinth against a blue wall |
| `ex1-0c2b`, `ex1-15df` | still 3:4 | Black fixie bike on white; bike with a basket |
| `showcase-4-4049` | still 3:4 | Cocktail on a bar under blue light |
| `b-2-146e` | still ~9:16 | Iced coffee pour on a blue background |
| `hero-4-0883` | still 3:4 | Macaron tower being assembled by hand |
| `b-3-001b` | still 4:3 | Blue bowl on tatami |
| `hero-2-018a` | still 3:4 | Phone showing a "Welcome to Atlas" app screen |

### People, lifestyle and creator-style
None of these is true selfie-style UGC. They are lifestyle and sport footage that can stand in for creator-style shots.
| Asset | Type, aspect | Content |
|---|---|---|
| `kling/r-1` | clip 16:9 | Athlete on a track with a bottle (sport ad) |
| `kling/r-3` | clip 16:9 | Man on a red scooter in a Mediterranean street |
| `kling/b-1` | clip 1:1 | Tennis serve, red dress, blue sky |
| `kling/b-2` | clip 9:16 | BMX rider in a concrete skatepark |
| `kling/b-3` / `kling/b-4` | clip 4:3 | Corgi running in a park; guitarist against a blue sky |
| `kling/b-5` | clip 21:9 | Cyclist in a city street at dusk |
| `sd/a-1`, `sd/u-1` | clip 16:9 | Man on a neon rooftop; man in a neon city |
| `sd/a-5` | clip 16:9 | Boxers |
| stills | 3:4 / 4:3 / 1:1 | `hero-3-0882` woman in a café, `ex3-2896` man at a blue-hour waterfront, `b-7-04d8` scarf close-up (1:1), `b-6-1a39` balloon and chair (1:1), `uc2-5fe3` friends in a boat, `uc3-48e4` child reading under lanterns, `uc1-80bf` hands pinning swatches, `showcase-7-052e` MTB jump (16:9), `showcase-8-185d` freediver, `hero-1-14f3` breakfast flat-lay |

### Cinematic and action
| Asset | Content |
|---|---|
| `sd/a-3`, `sd/a-4`, `sd/a-8`, `sd2/s2-3` | Jet in a canyon, motorbike in a lantern market, samurai in bamboo, horse rider with fire |
| `sd/l-1` … `sd/l-7` (1600×900) | City walls, rainy neon street, desert motorbikes, car in fog, wet-street car, rooftop runner, hangar figure |
| `sd/sd-1`, `sd/u-3`, `sd2/s2-1` | Aurora sci-fi, desert crash site, teal tunnel |
| stills | `showcase-6-3c39` armored figure in fire, `uc2-13ec` cat astronaut |

### Landscapes and places
- Clips: `sd/a-6` surfer barrel, `sd/a-7` sunset horizon, `sd/l-3` desert dunes, `sd/sd-1` aurora.
- Stills: `b-1-1ad3` cliff cabin over a fjord (1:1), `b-5-20d0` aerial beach umbrellas (~2.3:1), `showcase-2-154a` fox in snow, `hero-5-06ad` greenhouse at dusk, `ex3-05bf` blue door and yellow raincoat, `showcase-1-8679` coral arches.
- Banners, 2048×864 (~21:9): `carousel-1` lighthouse in waves, `-2` night mountaineers, `-3` breaching whale, `-4` viaduct train in snow, `-5` alien ship over cliffs, `-6` savanna sunset, `doc-caravan` desert monolith, `doc-eagle` eagle hunter.

### Graphic and type (most have baked-in text, so avoid them as Billboard backgrounds)
`showcase-3-42a6` "LISBOA" travel poster, `ex2-7621` "Ana & Leo" invite, `uc1-0b4c` bus-stop ad "Fresh air, every day",
`uc3-1803` "How Solar Works" board, and the 3D type stills `variant-1` "2", `variant-2` "PRO" and `variant-3` "EDIT". The
"PRO" and "EDIT" stills work as section art.

### Formats and aspects
| Aspect | Clips | Stills | Kiln outputs |
|---|---|---|---|
| 16:9 | 22 Seedance and 3 Kling `r-*` | `showcase-7` | Image, Video, Splice, Billboard (Landscape) |
| 9:16 | `kling/b-2` | `b-2-146e` (~9:16) | Image, Video, Splice, Billboard (Story) |
| 1:1 | `kling/b-1`, `b-6`, `b-7` | `b-1/b-6/b-7` stills | Image, Video, Splice, Billboard (Square) |
| 4:3 / 3:4 | `kling/b-3`, `b-4` | most stills | Image only |
| 21:9 | `kling/b-5` | 8 banners, `b-5-20d0` | none |

UI art: the `icons3d/*` set (compass, easel, clapper, headphones, puzzle, code, paintbrush, megaphone, scissors,
lightbulb, rocket, hourglass, microphone, filmreel) and the glyphs `g-frames` and `g-stopwatch`, both used on Explore.
`g-lens` is not used anywhere yet.

## 2. Studios today (from the code)

| Studio | Entry points | Inputs and steps | Feedback and loading | Output and label | Hand-offs |
|---|---|---|---|---|---|
| **Explore** `/explore` (`/` redirects here) | Nav, logo | Hero video (`sd2/s2-1`) and highlight cards → "Sample reel" of all 32 clips (play on hover) → stat cards → six tool cards → "Your recent work" → masonry of the 35 stills, each with Animate / Glaze / Ad on hover | Clips use `preload="none"` with posters; the hero pauses under reduced motion | Clip tiles carry a "Sample clip" badge and the reel says "Kiln did not generate these". Still tiles have no per-tile badge. | `?sample=<name>` to Video, Glaze and Billboard; recent images go to `/video?src=` |
| **Image** `/image` | Nav, "Get started", picker link "generate one" | Bottom composer: prompt (1000 characters), aspect (1:1, 4:3, 3:4, 16:9, 9:16), count 1–4, ⌘↵. The empty state offers 4 example prompts. | Shimmer card "Firing…" at the target aspect, error card with Retry / Dismiss, aria-live messages. A banner appears if the model isn't configured. | FLUX square output centre-cropped to the chosen aspect, badge "AI · FLUX.1 schnell". Gallery shows only `ai-generated`. | Animate (`/video?src=`), Remix, Download, Copy prompt. No link to Glaze or Billboard. |
| **Video** `/video` (`/motion` redirects here) | Nav, Image "Animate", Explore | 1 source image (Yours / Samples / upload / drop / paste) → 2 camera move from 9 presets (overlay, `P` key, animated tiles) → aspect 1:1, 16:9, 9:16 → length 3, 5 or 8 s → Render | Looping live canvas preview, progress bar with Cancel, error if the tab is hidden, note "not AI video generation" | WebM/MP4 badged "Local motion render", "Your clips" grid | Download only. Splice picks the result up from IndexedDB. |
| **Audio** `/audio` | Nav, Splice "Render a track" | Mood (Golden Hour, Night Drive, Tension, Lo-fi Room) → length 8, 16 or 30 s → Render track | Button reads "Rendering…" (offline render, faster than real time) | WAV badged "Local synth render", with a player | Download and Delete. No link to Splice. |
| **Glaze** `/glaze` | Nav, Explore "Glaze" | 1 image → 2 intensity slider → effect grid with 6 looks (Film Stock, Noir, Duotone, Glitch, VHS, Light Leak) | Live canvas preview at 900 px. There is no before/after view and the effect tiles have no thumbnails. | JPEG at up to 2048 px, labelled `local-edit`, saved and downloaded in one step. The preview itself carries no badge. | None. The result only shows up in other studios' "Yours" tab. |
| **Billboard** `/billboard` | Nav, Explore "Ad" | 1 hero image → 2 copy (headline 48, sub 90, CTA 24) → 3 format (Square 1080, Story 1080×1920, Landscape 1920×1080) and style (Band, Center, Split) | Live canvas redraw. The default copy is "Made in the kiln". | PNG labelled `local-edit` | None. Takes stills only, so no clips. |
| **Splice** `/splice` | Nav, Explore "Open Splice" | 1 add shots from your library (images and clips, sample stills included) or the strip of 32 sample clips (fetched as blobs) → 2 timeline with move up/down and remove, plus a running total → 3 soundtrack (your rendered tracks only) → aspect → Render edit | "Loading" overlay on the clip being fetched, progress bar with Cancel, hidden-tab error | WebM/MP4 badged "Local motion render". Stills get a fixed 2.5 s push-in, every segment gets a 0.25 s fade, and clips are cover-cropped and muted. | Download. The empty state links to Image and Video; the soundtrack step links to Audio. |

What Higgsfield does in the same places (observed, see the discovery docs):
- **Explore:** a hero carousel of video cards, preset rails with "Recreate" and community galleries.
- **Image:** the same docked composer, plus a model picker and a live credit price.
- **Video and Effects:** preset-first. A preset card with a `P` shortcut opens a masonry catalog of autoplaying preview videos. Effects has input slots (Character, Location, Products), and Video has a three-step "How it works" panel.
- **Not explored:** Ads Studio, Marketing Studio, Edit and Audio. Anything Kiln builds there is Kiln's own design, not parity.

### Labelling gaps found in the current code (fix before adding more samples)
1. **Explore highlight card.** It shows the still `showcase-3-42a6` captioned "Video · Push In · 5s". That reads as a Kiln render, and it is not even moving. Fix: add a "Sample" badge, or show a real live preview made with `drawFrame`.
2. **Image empty state.** It fans out stills `showcase-1` to `showcase-5` directly above the line "Kiln renders it with FLUX.1 schnell", which implies they are FLUX output. Fix: add a "Sample images" caption, or replace them with icons.
3. **Explore.** The hero video (`sd2/s2-1`), the still masonry and the Glaze stat card (`hero-2-018a`, unglazed) have no per-item badge.
4. **Derivative outputs.** Glaze, Billboard and Splice outputs made from samples are saved as `local-edit` or `local-render` with no trace of the sample. Proposed: an `fromSample` flag that adds "· from sample" to the label. Splice should also show "Sample" on sample stills in its library grid, as it already does for clips in the timeline.

## 3. Using the assets, per studio (proposals)

| Studio | Proposal | Specific assets |
|---|---|---|
| Explore | Replace the flat masonry with **category rails**: Product, Lifestyle, Cinematic, Landscapes, each with "Use in …" CTAs and a "Sample" badge on every tile | Product: `kling/b-6`, `kling/b-7`, `kling/r-2`, `sd2/s2-2`, `sd/u-2`, `showcase-5`. Lifestyle: `kling/r-1`, `kling/r-3`, `kling/b-1`, `kling/b-3`. Cinematic: `sd/a-8`, `sd/l-2`, `sd2/s2-3`. Landscapes: banners `carousel-1..6`. |
| Explore | **Hero carousel** of banners, Higgsfield-style, each banner linking to a flow (section 4) rather than a model | `carousel-3` whale (Video), `carousel-4` train (Splice), `doc-eagle` (Glaze Noir) |
| Image | Label the empty-state fan "Sample images". Add an "Or start from a sample →" row that links to Video or Glaze with `?sample=`. Do not present samples as FLUX results. | `b-1-1ad3`, `showcase-2-154a`, `hero-5-06ad` |
| Video | Per-preset **matched preview stills** instead of `showcase-1` for every tile. Each is a live `drawFrame` loop, so the motion is real and only the photo is a sample. | Push In: `showcase-2` fox. Pull Out: `b-1` cabin. Pan Right/Left: `b-5-20d0` beach. Crane Up: `hero-5` greenhouse. Dutch Roll: `showcase-6`. Handheld: `hero-3` café. Crash Zoom: `showcase-5` sneaker. Heartbeat: `showcase-4` cocktail. |
| Video | Empty state "Try one": 3 sample chips that load a still and start the live preview at once | `showcase-7-052e` (16:9), `b-2-146e` (9:16), `b-7-04d8` (1:1), matched to the output aspects |
| Glaze | **Before/after slider**, a draggable split of the original and the glazed canvas (both are already on hand) | — |
| Glaze | Effect tiles render a small thumbnail of the chosen image, or of a default sample when none is picked | Default `doc-eagle` (Noir), `carousel-6` (Film Stock, Light Leak), `sd/l-2` poster (Glitch, VHS) |
| Billboard | **Ad templates**: preset copy, format and style paired with a sample hero, labelled "Template · sample image" | Serum (`kling/b-6` poster, Square, Center), Bike (`ex1-0c2b`, Story, Split), Sneaker (`showcase-5`, Landscape, Band), Backpack (`kling/r-2` poster, Square, Split), Handbag (`ex2-1558`, Story, Band) |
| Billboard | Allow **clip posters** as hero images: the `.webp` posters are stills on the same CORS-enabled CDN, so `importSample` can be generalised | `kling/b-6`, `kling/b-7`, `kling/r-2`, `sd2/s2-2`, `sd/u-2` |
| Splice | **Starter timelines** ("Start from a template") that pre-fill 3–5 sample clips and suggest a mood | Sport: `kling/r-1`, `kling/b-1`, `kling/b-2`, `kling/b-5` + Night Drive. Product reveal: `sd/u-2`, `sd2/s2-2`, `kling/b-6`, `kling/b-7` + Tension. Travel: `kling/r-3`, `sd/a-6`, `sd/a-7` + Golden Hour. Cinematic: `sd/l-2`, `sd/l-5`, `sd/a-4`, `sd/a-8` + Tension. |
| Splice | Group the sample-clip strip by category, show aspect chips, and warn when cover-crop will cut heavily (`kling/b-5` 21:9 into 9:16) | All 32 |
| Audio | "Hear it under a clip": play a muted sample clip while the track previews | `sd/a-7` with Golden Hour, `sd/l-2` with Night Drive, `sd/u-3` with Tension, `kling/b-3` with Lo-fi Room |
| UI art | Use `g-lens` on Video's empty state or in the preset overlay header | `g-lens` |

## 4. End-to-end flows (proposed)

### F1. Product ad in 60 seconds
Sample product → Glaze → Billboard → Splice with a soundtrack.

| Step | Exists | Missing |
|---|---|---|
| 1. Pick a product sample (`showcase-5` sneaker or `ex2-1558` handbag) | Explore "Glaze" with `?sample=` | A product category or filter |
| 2. Glaze (Film Stock at 0.4) and save | Yes | Before/after; "Next: make an ad →" with `?src=<newId>` |
| 3. Billboard Story, Band, own copy and CTA, save | Yes; `?src=` is handled by SourcePicker | Templates; "Add to Splice →"; Billboard outputs are stills only |
| 4. Splice: the ad still plus `kling/b-6` and `kling/b-7` | Yes, by tapping the library and the sample strip | A deep link `/splice?add=<id>`; a sample badge in the library grid |
| 5. Soundtrack | Only if a track was rendered earlier in `/audio` | An inline "Render Golden Hour 16s" button in Splice (`renderMood` is offline and fast) |
| 6. Render 9:16 and download | Yes | Labelled "Local motion render · includes sample footage" |

### F2. Still to scored clip (Image → Video → Audio → Splice)
| Step | Exists | Missing |
|---|---|---|
| Generate with FLUX | Yes; needs Cloudflare credentials | — |
| Animate | The "Animate" link with `?src=` | — |
| Render the camera move | Yes | "Add to Splice →" on the result |
| Mood bed | Yes | "Use in Splice →" on the track |
| Cut with 1–2 sample clips (`sd/a-7`, `sd/l-6`) plus the track | Yes | Pre-selecting the newest track and the newest clip |

### F3. Sport promo from a starter timeline
Splice template "Sport" → reorder → Night Drive bed → 9:16. Missing: templates, inline audio and per-clip trim. Splice
plays every clip in full, so length is not under the user's control yet.

### F4. Moodboard to look
Explore Landscapes rail → banner `doc-eagle` → Glaze Noir with before/after → Video Crane Up → download. Missing: the
rail, before/after, and Glaze → Video hand-off. Note that Video crops the 21:9 banner to 16:9.

### F5. Cross-studio "Next step" bar (enables all of the above)
A shared component under every result with Animate, Glaze, Make ad, Add to Splice and Download. It reuses the `?src=`
parameter that SourcePicker already reads, plus a new `?add=` for Splice.

## 5. Prioritized build list

| # | Item | Effort | Why |
|---|---|---|---|
| 1 | Fix the labelling gaps in §2: the Explore highlight caption, the Image fan caption and per-tile "Sample" badges on Explore and SourcePicker | S | Brief compliance: no sample may read as Kiln output |
| 2 | "Next step" bar on Video, Glaze, Billboard and Audio results (`?src=`), plus `/splice?add=` | S | Turns six tools into one workflow; mostly links |
| 3 | Inline "Render track" in Splice (mood plus length, using `renderMood`) and auto-select of the new track | S | Removes the biggest detour in every flow |
| 4 | Glaze before/after slider | S | Shows what the effect changes; both canvases exist |
| 5 | Video preset tiles with matched sample stills (§3 table) | S | Catalog closer to Higgsfield's preset-first feel; motion stays real |
| 6 | `fromSample` provenance flag carried into Glaze, Billboard and Splice output labels | S | Keeps labels honest down the chain |
| 7 | Billboard templates (5) and clip posters as hero images | M | Product-ad flow in one click; uses the Kling and Seedance product shots |
| 8 | Splice starter timelines (4) and a categorised sample strip with crop warnings | M | Fills the empty state with real footage |
| 9 | Explore category rails and a banner hero carousel linking to flows | M | Discovery that mirrors Higgsfield's rails without copying their assets |
| 10 | Glaze effect thumbnails rendered from the current image | M | Pixel effects at 2048 px are slow, so thumbnails need small canvases |
| 11 | Splice per-clip trim and in/out, and keeping clip audio | M | Clips currently play in full and muted |
| 12 | Motion Billboard: copy overlay on a clip or a Video render, recorded like Splice | L | Video ads from the product clips; reuses `renderSplice` patterns |
| 13 | Glaze on video (apply per frame during the Splice render) | L | Consistent look across a cut; performance risk |
