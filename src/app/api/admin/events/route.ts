import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";
import { readEvents, writeEvents, newId, Ev } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

function sanitizeText(t: any) {
  return {
    title: String(t?.title ?? "").slice(0, 120),
    place: String(t?.place ?? "").slice(0, 120),
    desc: String(t?.desc ?? "").slice(0, 600),
    fee: String(t?.fee ?? "").slice(0, 80),
  };
}

// GET: all events (admin view). Also verifies the password.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const events = await readEvents();
    return NextResponse.json({ events, blob: true });
  } catch {
    return NextResponse.json({ events: [], blob: false });
  }
}

// POST: add an event. Body: { date, ja:{...}, en:{...} }
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const ev: Ev = {
      id: newId(),
      date: String(body?.date ?? "").slice(0, 60),
      deadline: String(body?.deadline ?? "").slice(0, 60),
      startDate: String(body?.startDate ?? "").slice(0, 10),
      deadlineDate: String(body?.deadlineDate ?? "").slice(0, 10),
      paused: !!body?.paused,
      image: String(body?.image ?? "").slice(0, 500),
      ja: sanitizeText(body?.ja),
      en: sanitizeText(body?.en),
    };
    const events = await readEvents();
    events.unshift(ev);
    await writeEvents(events);
    return NextResponse.json({ ok: true, event: ev });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "save_failed" }, { status: 500 });
  }
}

// PATCH: edit an event by id. Body: { id, date, ja, en }
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return NextResponse.json({ error: "not_found" }, { status: 404 });
    events[idx] = {
      id,
      date: String(body?.date ?? "").slice(0, 60),
      deadline: String(body?.deadline ?? "").slice(0, 60),
      startDate: String(body?.startDate ?? "").slice(0, 10),
      deadlineDate: String(body?.deadlineDate ?? "").slice(0, 10),
      paused: !!body?.paused,
      image: String(body?.image ?? "").slice(0, 500),
      ja: sanitizeText(body?.ja),
      en: sanitizeText(body?.en),
    };
    await writeEvents(events);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "save_failed" }, { status: 500 });
  }
}

// DELETE: remove an event by id (?id=...).
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    const events = await readEvents();
    const target = events.find((e) => e.id === id);
    const next = events.filter((e) => e.id !== id);
    await writeEvents(next);
    if (target?.image) { try { await del(target.image); } catch {} }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete_failed" }, { status: 500 });
  }
}
