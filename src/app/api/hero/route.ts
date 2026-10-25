import { NextResponse } from "next/server";
import { getHeroPublic } from "@/lib/heroStore";

export const dynamic = "force-dynamic";

// Public: hero images with focal points. Cached (list() runs at most once per
// revalidation window) to stay within Blob free-tier limits.
export async function GET() {
  try {
    return NextResponse.json({ images: await getHeroPublic() });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
