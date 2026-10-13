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
