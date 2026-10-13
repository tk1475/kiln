export interface Frame {
  scale: number;
  x: number; // fraction of output width
  y: number; // fraction of output height
  rotate: number; // degrees
}

export interface Preset {
  id: string;
  name: string;
  hint: string;
  at: (t: number) => Frame; // t in [0, 1]
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const F = (scale = 1, x = 0, y = 0, rotate = 0): Frame => ({ scale, x, y, rotate });

export const PRESETS: Preset[] = [
  { id: "push-in", name: "Push In", hint: "Slow dolly toward the subject", at: (t) => F(lerp(1.02, 1.28, ease(t))) },
  { id: "pull-out", name: "Pull Out", hint: "Reveal the wider scene", at: (t) => F(lerp(1.32, 1.02, ease(t))) },
  { id: "pan-right", name: "Pan Right", hint: "Lateral track across the frame", at: (t) => F(1.22, lerp(0.08, -0.08, ease(t))) },
  { id: "pan-left", name: "Pan Left", hint: "Lateral track, opposite way", at: (t) => F(1.22, lerp(-0.08, 0.08, ease(t))) },
  { id: "crane-up", name: "Crane Up", hint: "Rise up over the scene", at: (t) => F(1.22, 0, lerp(-0.08, 0.08, ease(t))) },
  { id: "dutch-roll", name: "Dutch Roll", hint: "Uneasy tilt with a slow push", at: (t) => F(lerp(1.25, 1.35, t), 0, 0, lerp(-5, 5, ease(t))) },
  {
    id: "handheld",
    name: "Handheld",
    hint: "Documentary camera shake",
    at: (t) => {
      const s = t * 40;
      return F(1.12, 0.012 * Math.sin(s * 1.3) + 0.006 * Math.sin(s * 3.7), 0.01 * Math.sin(s * 1.9 + 1) + 0.005 * Math.sin(s * 4.3), 0.6 * Math.sin(s * 0.9));
    },
  },
  { id: "crash-zoom", name: "Crash Zoom", hint: "Hold, then snap in hard", at: (t) => F(t < 0.6 ? 1.02 : lerp(1.02, 1.9, ((t - 0.6) / 0.4) ** 3)) },
  { id: "heartbeat", name: "Heartbeat", hint: "Rhythmic pulse", at: (t) => F(1.06 + 0.05 * Math.max(0, Math.sin(t * Math.PI * 6)) ** 6) },
];

export const OUTPUT_SIZES = {
  "1:1": [720, 720],
  "16:9": [1280, 720],
  "9:16": [720, 1280],
} as const;

export type MotionAspect = keyof typeof OUTPUT_SIZES;

/** Draws `img` cover-fitted into the canvas with the preset's frame at time t. */
export function drawFrame(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, preset: Preset, t: number) {
  const { width: W, height: H } = ctx.canvas;
  const f = preset.at(Math.min(1, Math.max(0, t)));
  const cover = Math.max(W / img.width, H / img.height) * f.scale;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2 + f.x * W, H / 2 + f.y * H);
  ctx.rotate((f.rotate * Math.PI) / 180);
  ctx.drawImage(img, (-img.width * cover) / 2, (-img.height * cover) / 2, img.width * cover, img.height * cover);
  ctx.restore();
}

function pickMime() {
  const options = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return options.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
}

export const HIDDEN_ERROR = "Rendering stopped because the tab was hidden. Keep Kiln visible while it renders, then try again.";

/** Tracks whether the page was hidden at any point; real-time capture breaks when it is. */
export function watchHidden() {
  const state = { hidden: document.hidden, stop: () => document.removeEventListener("visibilitychange", on) };
  function on() { if (document.hidden) state.hidden = true; }
  document.addEventListener("visibilitychange", on);
  return state;
}

export function canRecord() {
  return typeof MediaRecorder !== "undefined" && !!pickMime() && "captureStream" in HTMLCanvasElement.prototype;
}

/** Renders the motion clip in real time and returns the encoded video. */
export function renderMotion(
  img: HTMLImageElement,
  preset: Preset,
  aspect: MotionAspect,
  durationS: number,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const mime = pickMime();
  if (!mime) return Promise.reject(new Error("This browser can't record video. Try Chrome, Edge or Firefox."));
  if (document.hidden) return Promise.reject(new Error(HIDDEN_ERROR));
  const vis = watchHidden();
  const [W, H] = OUTPUT_SIZES[aspect];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  drawFrame(ctx, img, preset, 0);

  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  return new Promise((resolve, reject) => {
    let raf = 0;
    let start = 0;
    rec.onstop = () => {
      cancelAnimationFrame(raf);
      vis.stop();
      stream.getTracks().forEach((tr) => tr.stop());
      if (signal.aborted) reject(new DOMException("Cancelled", "AbortError"));
      else if (vis.hidden) reject(new Error(HIDDEN_ERROR));
      else resolve(new Blob(chunks, { type: mime.split(";")[0] }));
    };
    rec.onerror = () => reject(new Error("Recording failed."));
    signal.addEventListener("abort", () => rec.state !== "inactive" && rec.stop(), { once: true });

    const tick = (now: number) => {
      if (vis.hidden) { rec.stop(); return; }
      if (!start) start = now;
      const t = (now - start) / (durationS * 1000);
      drawFrame(ctx, img, preset, t);
      onProgress(Math.min(1, t));
      if (t >= 1) rec.stop();
      else raf = requestAnimationFrame(tick);
    };
    rec.start(250);
    raf = requestAnimationFrame(tick);
  });
}
