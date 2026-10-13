"use client";

// Blobs here are immutable assets, so one URL per blob is cached for the session.
const cache = new WeakMap<Blob, string>();

export function useObjectUrl(blob?: Blob) {
  if (!blob || typeof window === "undefined") return undefined;
  let url = cache.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    cache.set(blob, url);
  }
  return url;
}
