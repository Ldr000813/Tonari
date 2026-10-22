import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { createPoll, listPolls } from "@/lib/pollStore";

export const dynamic = "force-dynamic";

// GET: list polls (admin, for managing/sharing again)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ polls: await listPolls(), blob: true });
  } catch {
    return NextResponse.json({ polls: [], blob: false });
  }
}

// POST: create a poll (admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim().slice(0, 120);
    const note = String(body?.note ?? "").slice(0, 300);
    const dates = (Array.isArray(body?.dates) ? body.dates : [])
      .map((d: any) => String(d).trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 30);
    if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });
    if (!dates.length) return NextResponse.json({ error: "dates_required" }, { status: 400 });
    const poll = await createPoll({ title, note, dates });
    return NextResponse.json({ ok: true, id: poll.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "create_failed" }, { status: 500 });
  }
}
