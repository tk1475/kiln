// Curated from the ImagineArt asset library (cdn-imagine.vyro.ai). CORS-enabled, so samples work in canvas tools.
const BASE = "https://cdn-imagine.vyro.ai/everask-lp-assets";

export const libraryUrl = (name: string) => `${BASE}/asset-library/${name}.webp`;
export const icon3d = (name: string) => `${BASE}/icons3d/${name}.webp`;

/** Wide 2048×864 banners for hero cards. */
export const BANNERS = ["carousel-1-11d8c8aa", "carousel-2-03b81ab9", "carousel-3-6f804343", "carousel-4-03ef21b4", "carousel-5-28ff79f4", "carousel-6-1afc4715", "doc-eagle-3ba4b54b", "doc-caravan-fa01652a"];

/** Portrait and square samples for galleries and source pickers. */
export const SAMPLES = [
  "showcase-1-86792cb9", "showcase-2-154a11c2", "showcase-3-42a670bc", "showcase-4-4049b4b1", "showcase-5-a57eabf1", "showcase-6-3c3926db", "showcase-7-052e46d5", "showcase-8-185dbd67",
  "hero-1-14f3b679", "hero-2-018a6a7b", "hero-3-08822d30", "hero-4-08838962", "hero-5-06adcb43", "variant-1-5749fd73", "variant-2-04562855", "variant-3-58190732",
  "ex1-0c2bbc4f", "ex1-15df6df3", "ex2-1558aea1", "ex2-762166cb", "ex3-05bfd983", "ex3-28967cdd",
  "uc1-0b4c5187", "uc1-80bfff76", "uc2-13ec585c", "uc2-5fe3dec4", "uc3-18030945", "uc3-48e4d4bc",
  "b-1-1ad30c53", "b-2-146edf0f", "b-3-001bc645", "b-4-05996bee", "b-5-20d03f96", "b-6-1a39d689", "b-7-04d8c0ab",
];

export const TOOL_ICONS: Record<string, string> = {
  explore: "compass", image: "easel", video: "clapper", audio: "headphones", mcp: "puzzle", api: "code",
  glaze: "paintbrush", billboard: "megaphone", splice: "scissors",
};

const CLIP_BASE = `${BASE}/sky/video`;

export interface SampleClip { id: string; set: "cinema-seedance" | "cinema-seedance-2" | "models-kling"; w: number; h: number }

const set = (name: SampleClip["set"], w: number, h: number, ids: string[]) => ids.map((id) => ({ id, set: name, w, h }));

/** Sample clips with matching .webp posters. Reference footage from the asset library, not Kiln output. */
export const CLIPS: SampleClip[] = [
  ...set("cinema-seedance-2", 1120, 630, ["s2-1", "s2-2", "s2-3"]),
  ...set("cinema-seedance", 1120, 630, ["a-1", "a-2", "a-3", "a-4", "a-5", "a-6", "a-7", "a-8", "u-1", "u-2", "u-3"]),
  ...set("cinema-seedance", 1600, 900, ["sd-1", "l-1", "l-2", "l-3", "l-4", "l-5", "l-6", "l-7"]),
  ...set("models-kling", 1280, 720, ["r-1", "r-2", "r-3"]),
  ...set("models-kling", 960, 720, ["b-3", "b-4"]),
  ...set("models-kling", 960, 960, ["b-1", "b-6", "b-7"]),
  ...set("models-kling", 720, 1280, ["b-2"]),
  ...set("models-kling", 1280, 540, ["b-5"]),
];

export const clipUrl = (c: SampleClip) => `${CLIP_BASE}/${c.set}/${c.id}.mp4`;
export const clipPoster = (c: SampleClip) => `${CLIP_BASE}/${c.set}/${c.id}.webp`;
export const clipKey = (c: SampleClip) => `${c.set}/${c.id}`;

/** 360px 3D glyphs from the same set. */
export const glyph = (name: "frames" | "lens" | "stopwatch") => `${CLIP_BASE}/cinema-seedance/g-${name}.webp`;
