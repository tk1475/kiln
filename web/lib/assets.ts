import { createStore, del, get, keys, set } from "idb-keyval";

export type AssetLabel = "ai-generated" | "local-render" | "local-synth" | "local-edit" | "user-upload";

export interface Asset {
  id: string;
  kind: "image" | "motion" | "audio";
  label: AssetLabel;
  createdAt: number;
  blob: Blob;
  width: number;
  height: number;
  prompt?: string;
  model?: string;
  aspect?: string;
  presetId?: string;
  durationS?: number;
  sourceId?: string;
}

const store = typeof indexedDB !== "undefined" ? createStore("kiln", "assets") : undefined;

export async function saveAsset(a: Asset) {
  if (store) await set(a.id, a, store);
}

export async function getAsset(id: string) {
  return store ? get<Asset>(id, store) : undefined;
}

export async function deleteAsset(id: string) {
  if (store) await del(id, store);
}

export async function listAssets(kind?: Asset["kind"]): Promise<Asset[]> {
  if (!store) return [];
  const ids = await keys<string>(store);
  const all = await Promise.all(ids.map((id) => get<Asset>(id, store)));
  return all
    .filter((a): a is Asset => !!a && (!kind || a.kind === kind))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export const LABEL_TEXT: Record<AssetLabel, string> = {
  "ai-generated": "AI · FLUX.1 schnell",
  "local-render": "Local motion render",
  "local-synth": "Local synth render",
  "local-edit": "Local edit",
  "user-upload": "Your upload",
};

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
