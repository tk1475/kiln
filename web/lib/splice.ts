import type { Asset } from "@/lib/assets";
import { loadImage } from "@/lib/image";
import { HIDDEN_ERROR, OUTPUT_SIZES, MotionAspect, PRESETS, drawFrame, watchHidden } from "@/lib/motion";

export const STILL_S = 2.5;
const FADE_S = 0.25;
const pushIn = PRESETS.find((p) => p.id === "push-in")!;

function pickMime(withAudio: boolean) {
  const opts = withAudio
    ? ["video/mp4;codecs=avc1,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    : ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm"];
  return opts.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
}

function coverVideo(ctx: CanvasRenderingContext2D, v: HTMLVideoElement) {
  const { width: W, height: H } = ctx.canvas;
  const s = Math.max(W / v.videoWidth, H / v.videoHeight);
  ctx.drawImage(v, (W - v.videoWidth * s) / 2, (H - v.videoHeight * s) / 2, v.videoWidth * s, v.videoHeight * s);
}

function fade(ctx: CanvasRenderingContext2D, t: number, dur: number) {
  const a = Math.max(0, 1 - Math.min(t, dur - t) / FADE_S);
  if (a > 0) {
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

type Seg = { kind: "still"; img: HTMLImageElement; dur: number } | { kind: "clip"; video: HTMLVideoElement; dur: number };

async function prepare(items: Asset[]): Promise<Seg[]> {
  return Promise.all(
    items.map(async (a): Promise<Seg> => {
      if (a.kind === "image") return { kind: "still", img: await loadImage(a.blob), dur: STILL_S };
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(a.blob);
      await new Promise((r, j) => { video.onloadedmetadata = r; video.onerror = () => j(new Error("Couldn't read a clip.")); });
      return { kind: "clip", video, dur: Number.isFinite(video.duration) ? video.duration : a.durationS ?? 3 };
    }),
  );
}

export function totalSeconds(items: Asset[]) {
  return items.reduce((s, a) => s + (a.kind === "image" ? STILL_S : a.durationS ?? 3), 0);
}

/** Plays every segment onto a canvas in order and records it, with an optional soundtrack. */
export async function renderSplice(
  items: Asset[],
  aspect: MotionAspect,
  track: Asset | undefined,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const mime = pickMime(!!track);
  if (!mime) throw new Error("This browser can't record video. Try Chrome, Edge or Firefox.");
  if (document.hidden) throw new Error(HIDDEN_ERROR);
  const vis = watchHidden();
  const segs = await prepare(items);
  const total = segs.reduce((s, x) => s + x.dur, 0);

  const [W, H] = OUTPUT_SIZES[aspect];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillRect(0, 0, W, H);
  const stream = canvas.captureStream(30);

  let audioCtx: AudioContext | undefined;
  if (track) {
    audioCtx = new AudioContext();
    const buf = await audioCtx.decodeAudioData(await track.blob.arrayBuffer());
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = buf.duration < total;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, audioCtx.currentTime + Math.max(0, total - 1));
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + total);
    const dest = audioCtx.createMediaStreamDestination();
    src.connect(gain).connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    src.start();
  }

  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<void>((r) => (rec.onstop = () => r()));
  rec.start(250);

  let elapsed = 0;
  try {
    for (const seg of segs) {
      if (signal.aborted || vis.hidden) break;
      if (seg.kind === "clip") { seg.video.currentTime = 0; await seg.video.play().catch(() => {}); }
      await new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = (now - start) / 1000;
          if (seg.kind === "still") drawFrame(ctx, seg.img, pushIn, t / seg.dur);
          else coverVideo(ctx, seg.video);
          fade(ctx, t, seg.dur);
          onProgress(Math.min(1, (elapsed + t) / total));
          if (seg.kind === "clip" && seg.video.paused && !seg.video.ended) seg.video.play().catch(() => {});
          if (t >= seg.dur || signal.aborted || vis.hidden) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      if (seg.kind === "clip") seg.video.pause();
      elapsed += seg.dur;
    }
  } finally {
    vis.stop();
    rec.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    await audioCtx?.close();
    segs.forEach((s) => (s.kind === "clip" ? URL.revokeObjectURL(s.video.src) : URL.revokeObjectURL(s.img.src)));
  }
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  if (vis.hidden) throw new Error(HIDDEN_ERROR);
  return new Blob(chunks, { type: mime.split(";")[0] });
}
