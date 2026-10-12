import { NextResponse } from "next/server";
import { readEvents } from "@/lib/siteStore";
import { evStatus } from "@/lib/eventStatus";

export const dynamic = "force-dynamic";

// Public: events shown on the events page.
// - 一時停止(paused) のものは出さない
// - 締切/開催日から1週間を過ぎたものは自動で非表示
// - 締切/開催日を過ぎたものは closed:true を付けて「締め切りました」表示に
export async function GET() {
  try {
    const now = new Date();
    const events = (await readEvents())
      .filter((e) => !e.paused)
      .map((e) => ({ e, s: evStatus(e, now) }))
      .filter(({ s }) => !s.hidden)
      .map(({ e, s }) => ({ ...e, closed: s.closed }));
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
