export const ASPECTS = [
  { id: "1:1", w: 1, h: 1 },
  { id: "4:3", w: 4, h: 3 },
  { id: "3:4", w: 3, h: 4 },
  { id: "16:9", w: 16, h: 9 },
  { id: "9:16", w: 9, h: 16 },
] as const;

export type AspectId = (typeof ASPECTS)[number]["id"];

export function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

/** Center-crops the model's square output to the requested aspect ratio. */
export async function cropToAspect(blob: Blob, aspect: AspectId) {
  const img = await loadImage(blob);
  const a = ASPECTS.find((x) => x.id === aspect)!;
  const src = img.naturalWidth / img.naturalHeight;
  const target = a.w / a.h;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (target > src) sh = Math.round(sw / target);
  else sw = Math.round(sh * target);
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  canvas.getContext("2d")!.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, sw, sh);
  URL.revokeObjectURL(img.src);
  const out = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), "image/jpeg", 0.92),
  );
  return { blob: out, width: sw, height: sh };
}
