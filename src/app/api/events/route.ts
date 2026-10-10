import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-side proxy to the stamp app's public events API.
// Fetching from the server avoids cross-origin (CORS) issues in the browser.
const SOURCE = "https://stamp-app-two.vercel.app/api/events";

export async function GET() {
  try {
    const r = await fetch(SOURCE, { cache: "no-store" });
    const j = await r.json();
    return NextResponse.json({ events: j.events || [] });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
