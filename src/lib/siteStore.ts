import { list, put } from "@vercel/blob";

// ---- Generic image listing (used by gallery) ----
export async function listByPrefix(prefix: string) {
  const { blobs } = await list({ prefix });
  // newest first (pathname starts with Date.now())
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

// ---- Events (stored as a single JSON blob) ----
const EVENTS_PATH = "site-meta/events.json";

export type EvText = { title: string; place: string; desc: string };
export type Ev = { id: string; date: string; ja: EvText; en: EvText };

export async function readEvents(): Promise<Ev[]> {
  try {
    const { blobs } = await list({ prefix: EVENTS_PATH });
    const b = blobs.find((x) => x.pathname === EVENTS_PATH);
    if (!b) return [];
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? (data as Ev[]) : [];
  } catch {
    return [];
  }
}

export async function writeEvents(events: Ev[]): Promise<void> {
  await put(EVENTS_PATH, JSON.stringify(events), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
