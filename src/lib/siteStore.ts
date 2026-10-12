import { list, put } from "@vercel/blob";

// ---- Generic image listing (used by gallery) ----
export async function listByPrefix(prefix: string) {
  const { blobs } = await list({ prefix });
  // newest first (pathname starts with Date.now())
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

// ---- Events (stored as a single JSON blob) ----
const EVENTS_PATH = "site-meta/events.json";

export type EvText = { title: string; place: string; desc: string; fee: string };
export type Ev = { id: string; date: string; deadline: string; image: string; ja: EvText; en: EvText };

export async function readEvents(): Promise<Ev[]> {
  try {
    const { blobs } = await list({ prefix: EVENTS_PATH });
    const b = blobs.find((x) => x.pathname === EVENTS_PATH);
    if (!b) return [];
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    // normalize so older records (saved before new fields existed) have a full shape
    const txt = (t: any): EvText => ({
      title: t?.title ?? "", place: t?.place ?? "", desc: t?.desc ?? "", fee: t?.fee ?? "",
    });
    return data.map((e: any): Ev => ({
      id: String(e?.id ?? ""),
      date: e?.date ?? "",
      deadline: e?.deadline ?? "",
      image: e?.image ?? "",
      ja: txt(e?.ja), en: txt(e?.en),
    }));
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
