export interface Glaze {
  id: string;
  name: string;
  hint: string;
  apply: (ctx: CanvasRenderingContext2D, img: CanvasImageSource, k: number) => void;
}

function rand(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function base(ctx: CanvasRenderingContext2D, img: CanvasImageSource, filter = "none") {
  const { width: W, height: H } = ctx.canvas;
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, 0, 0, W, H);
  ctx.restore();
}

function vignette(ctx: CanvasRenderingContext2D, k: number) {
  const { width: W, height: H } = ctx.canvas;
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) / 2);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.75 * k})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function pixels(ctx: CanvasRenderingContext2D, fn: (d: Uint8ClampedArray, W: number, H: number) => void) {
  const { width: W, height: H } = ctx.canvas;
  const im = ctx.getImageData(0, 0, W, H);
  fn(im.data, W, H);
  ctx.putImageData(im, 0, 0);
}

function grain(ctx: CanvasRenderingContext2D, amount: number) {
  const r = rand(7);
  pixels(ctx, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * amount;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
  });
}

export const GLAZES: Glaze[] = [
  {
    id: "film", name: "Film Stock", hint: "Warm tone, grain, vignette",
    apply: (ctx, img, k) => { base(ctx, img, `sepia(${0.3 * k}) contrast(${1 + 0.12 * k}) saturate(${1 + 0.15 * k})`); grain(ctx, 50 * k); vignette(ctx, k); },
  },
  {
    id: "noir", name: "Noir", hint: "Hard black and white",
    apply: (ctx, img, k) => { base(ctx, img, `grayscale(1) contrast(${1 + 0.6 * k}) brightness(${1 - 0.08 * k})`); grain(ctx, 30 * k); vignette(ctx, k); },
  },
  {
    id: "duotone", name: "Duotone", hint: "Ink and ember two-colour print",
    apply: (ctx, img, k) => {
      base(ctx, img);
      const lo = [18, 22, 48], hi = [255, 140, 70];
      pixels(ctx, (d) => {
        for (let i = 0; i < d.length; i += 4) {
          const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * (1 - k) + (lo[c] + (hi[c] - lo[c]) * l) * k;
        }
      });
    },
  },
  {
    id: "glitch", name: "Glitch", hint: "RGB split and slice tears",
    apply: (ctx, img, k) => {
      base(ctx, img);
      const { width: W, height: H } = ctx.canvas;
      const shift = Math.round(W * 0.012 * k);
      pixels(ctx, (d) => {
        const src = d.slice();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          d[i] = src[(y * W + Math.min(W - 1, x + shift)) * 4];
          d[i + 2] = src[(y * W + Math.max(0, x - shift)) * 4 + 2];
        }
      });
      const r = rand(42);
      for (let s = 0; s < Math.round(12 * k); s++) {
        const y = Math.floor(r() * H), h = Math.ceil(r() * H * 0.04) + 2, dx = Math.round((r() - 0.5) * W * 0.12 * k);
        ctx.drawImage(ctx.canvas, 0, y, W, h, dx, y, W, h);
      }
    },
  },
  {
    id: "vhs", name: "VHS", hint: "Scanlines, bleed, soft tape",
    apply: (ctx, img, k) => {
      base(ctx, img, `blur(${0.8 * k}px) saturate(${1 + 0.4 * k}) contrast(${1 - 0.1 * k})`);
      const { width: W, height: H } = ctx.canvas;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * k;
      ctx.filter = "hue-rotate(-40deg)";
      ctx.drawImage(ctx.canvas, Math.round(4 * k), 0);
      ctx.restore();
      ctx.fillStyle = `rgba(0,0,0,${0.22 * k})`;
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      grain(ctx, 25 * k);
    },
  },
  {
    id: "leak", name: "Light Leak", hint: "Sun-flare glow from the edge",
    apply: (ctx, img, k) => {
      base(ctx, img, `brightness(${1 + 0.05 * k})`);
      const { width: W, height: H } = ctx.canvas;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const [x, y, c] of [[0, 0, "255,120,40"], [W, H * 0.3, "255,200,90"]] as const) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.7);
        g.addColorStop(0, `rgba(${c},${0.85 * k})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    },
  },
];
