import { NextResponse } from "next/server";
import { listByPrefix } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

// Public: photos shown on the gallery page (admin-uploaded, prefix "gallery/").
export async function GET() {
  try {
    const blobs = await listByPrefix("gallery/");
    const images = blobs.map((b) => ({ url: b.url, pathname: b.pathname }));
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
