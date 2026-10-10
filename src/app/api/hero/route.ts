import { NextResponse } from "next/server";
import { readPositions, listHero } from "@/lib/heroStore";

export const dynamic = "force-dynamic";

// Public: the hero images shown on the home page. Returns the images uploaded by
// the admin (stored in Vercel Blob under the "hero/" prefix), each with its focal
// point as a CSS object-position string. If Blob is not configured yet, returns
// an empty list and the home page uses its defaults.
export async function GET() {
  try {
    const blobs = await listHero();
    const pos = await readPositions();
    const images = blobs.map((b) => {
      const p = pos[b.pathname] || { x: 50, y: 50 };
      return { url: b.url, pos: `${p.x}% ${p.y}%` };
    });
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
