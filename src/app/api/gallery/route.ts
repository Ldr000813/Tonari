import { NextResponse } from "next/server";
import { getGalleryCached } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

// Public: photos shown on the gallery page (cached to limit Blob list() calls).
export async function GET() {
  try {
    return NextResponse.json({ images: await getGalleryCached() });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
