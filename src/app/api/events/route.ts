import { NextResponse } from "next/server";
import { readEvents } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

// Public: upcoming/past events shown on the events page.
export async function GET() {
  try {
    const events = await readEvents();
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
