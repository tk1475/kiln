/** Reads duration in seconds from an MP4's mvhd box, without a media element (those stall in background tabs). */
export function mp4Duration(b: Uint8Array): number | undefined {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 4; i < b.length - 32; i++) {
    if (b[i] !== 0x6d || b[i + 1] !== 0x76 || b[i + 2] !== 0x68 || b[i + 3] !== 0x64) continue; // "mvhd"
    const v1 = b[i + 4] === 1;
    const scale = d.getUint32(i + (v1 ? 24 : 16));
    const dur = v1 ? Number(d.getBigUint64(i + 28)) : d.getUint32(i + 20);
    return scale ? Math.round((dur / scale) * 10) / 10 : undefined;
  }
}

/** Size and duration of a video file. Falls back to the MP4 header if the media element doesn't load in time. */
export async function probeVideo(blob: Blob): Promise<{ width: number; height: number; durationS: number }> {
  const v = document.createElement("video");
  v.preload = "metadata";
  v.muted = true;
  v.src = URL.createObjectURL(blob);
  try {
    const ok = await Promise.race([
      new Promise<boolean>((r) => { v.onloadedmetadata = () => r(true); v.onerror = () => r(false); }),
      new Promise<boolean>((r) => setTimeout(() => r(false), 5000)),
    ]);
    if (ok && Number.isFinite(v.duration)) return { width: v.videoWidth, height: v.videoHeight, durationS: Math.round(v.duration * 10) / 10 };
    const durationS = mp4Duration(new Uint8Array(await blob.arrayBuffer()));
    if (!durationS) throw new Error("Couldn't read that video. Try an MP4 or WebM file.");
    return { width: v.videoWidth || 1280, height: v.videoHeight || 720, durationS };
  } finally {
    URL.revokeObjectURL(v.src);
  }
}
