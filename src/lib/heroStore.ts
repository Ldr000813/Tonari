import { list, put } from "@vercel/blob";

// Per-image focal point (object-position), stored as a single JSON blob keyed by
// the image's pathname. Kept under a separate prefix so it never shows up as a
// hero image itself.
const POS_PATH = "hero-meta/positions.json";

export type Pos = { x: number; y: number }; // 0–100 (%)
export type PosMap = Record<string, Pos>;

export function clampPos(x: any, y: any): Pos {
  const c = (n: any) => Math.min(100, Math.max(0, Math.round(Number(n))));
  return { x: isNaN(Number(x)) ? 50 : c(x), y: isNaN(Number(y)) ? 50 : c(y) };
}

export async function readPositions(): Promise<PosMap> {
  try {
    const { blobs } = await list({ prefix: POS_PATH });
    const b = blobs.find((x) => x.pathname === POS_PATH);
    if (!b) return {};
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return {};
    return (await r.json()) as PosMap;
  } catch {
    return {};
  }
}

export async function writePositions(map: PosMap): Promise<void> {
  await put(POS_PATH, JSON.stringify(map), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function listHero() {
  const { blobs } = await list({ prefix: "hero/" });
  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
}
