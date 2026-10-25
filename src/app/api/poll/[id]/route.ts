import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { revalidateTag } from "next/cache";
import { getPollView, deletePoll, updatePoll } from "@/lib/pollStore";

export const dynamic = "force-dynamic";

// GET: public — poll meta + all responses (cached; voting invalidates it)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = await getPollView(params.id);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH: admin — 中止/再開 や 内容の編集（タイトル・説明・候補日）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const fields: any = {};
    if ("title" in body) fields.title = String(body.title ?? "").trim();
    if ("note" in body) fields.note = String(body.note ?? "");
    if ("dates" in body) fields.dates = (Array.isArray(body.dates) ? body.dates : []).map((d: any) => String(d).trim()).filter(Boolean);
    if ("closed" in body) fields.closed = !!body.closed;
    if ("title" in fields && !fields.title) return NextResponse.json({ error: "title_required" }, { status: 400 });
    if ("dates" in fields && !fields.dates.length) return NextResponse.json({ error: "dates_required" }, { status: 400 });
    const updated = await updatePoll(params.id, fields);
    if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
    revalidateTag(`poll-${params.id}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update_failed" }, { status: 500 });
  }
}

// DELETE: admin — remove the poll and all its responses
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await deletePoll(params.id);
    revalidateTag(`poll-${params.id}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete_failed" }, { status: 500 });
  }
}
