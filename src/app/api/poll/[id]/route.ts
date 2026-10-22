import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getPollMeta, getResponses, deletePoll, setPollClosed } from "@/lib/pollStore";

export const dynamic = "force-dynamic";

// GET: public — poll meta + all responses (for the shared voting page)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const poll = await getPollMeta(params.id);
  if (!poll) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const responses = await getResponses(params.id);
  return NextResponse.json({ poll, responses });
}

// PATCH: admin — 中止/再開（受付の締め切り切替）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { closed } = await req.json();
    const ok = await setPollClosed(params.id, !!closed);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
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
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete_failed" }, { status: 500 });
  }
}
