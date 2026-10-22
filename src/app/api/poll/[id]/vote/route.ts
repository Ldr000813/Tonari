import { NextRequest, NextResponse } from "next/server";
import { getPollMeta, addResponse, Pick } from "@/lib/pollStore";

export const dynamic = "force-dynamic";

// POST: public, anonymous — add one availability response
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const poll = await getPollMeta(params.id);
  if (!poll) return NextResponse.json({ error: "not_found" }, { status: 404 });
  try {
    const body = await req.json();
    const picks: Record<string, Pick> = {};
    for (const d of poll.dates) {
      const v = body?.picks?.[d];
      if (v === "yes" || v === "maybe" || v === "no") picks[d] = v;
    }
    const name = String(body?.name ?? "").trim().slice(0, 40) || "匿名";
    await addResponse(params.id, { name, picks });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "vote_failed" }, { status: 500 });
  }
}
