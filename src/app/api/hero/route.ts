import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Public: the hero images shown on the home page. Returns the images uploaded by
// the admin (stored in Vercel Blob under the "hero/" prefix). If Blob is not
// configured yet, returns an empty list and the home page uses its defaults.
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "hero/" });
    const images = blobs
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map((b) => b.url);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
