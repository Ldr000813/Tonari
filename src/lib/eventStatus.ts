// Pure date logic for events — no Blob import, so it's safe to use on both the
// server (API routes) and the client (admin / events page).

export type EvStatusInput = {
  paused?: boolean;
  startDate?: string;    // 開催日 "YYYY-MM-DD"
  deadlineDate?: string; // 応募締め切り "YYYY-MM-DD"
};

const DAY = 24 * 60 * 60 * 1000;

// end of that day in Japan time (so "10/15" counts through 23:59 JST)
function endOfDayJST(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T23:59:59+09:00");
  return isNaN(d.getTime()) ? null : d;
}

export type EvStatus = {
  closed: boolean;   // past the deadline or the event date → show "締め切りました"
  hidden: boolean;   // more than a week past → hide from the public page
  hasDates: boolean; // any machine date set (otherwise no auto behavior)
};

export function evStatus(e: EvStatusInput, now: Date = new Date()): EvStatus {
  const start = endOfDayJST(e.startDate);
  const deadline = endOfDayJST(e.deadlineDate);
  const times = [start, deadline].filter(Boolean) as Date[];
  const hasDates = times.length > 0;

  const closed = (!!deadline && now > deadline) || (!!start && now > start);

  let hidden = false;
  if (hasDates) {
    const last = new Date(Math.max(...times.map((d) => d.getTime())));
    hidden = now.getTime() > last.getTime() + 7 * DAY;
  }
  return { closed, hidden, hasDates };
}

// Format "YYYY-MM-DD" for display (timezone-neutral).
export function fmtDate(s: string | undefined, lang: "ja" | "en"): string {
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  const y = +m[1], mo = +m[2], d = +m[3];
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  if (lang === "ja") {
    const w = ["日", "月", "火", "水", "木", "金", "土"][wd];
    return `${mo}/${d}（${w}）`;
  }
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1];
  const w = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][wd];
  return `${mon} ${d} (${w})`;
}
