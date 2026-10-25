import { list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";

// ---- Generic image listing (used by gallery) ----
export async function listByPrefix(prefix: string) {
  const { blobs } = await list({ prefix });
  // newest first (pathname starts with Date.now())
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

// 公開ページ用（キャッシュ）。list()/読み込みは有効期間に1回だけ。
// 管理画面で更新時は revalidateTag("gallery") / "events" で即時更新。
export const getGalleryCached = unstable_cache(
  async () => (await listByPrefix("gallery/")).map((b) => ({ url: b.url, pathname: b.pathname })),
  ["gallery-public"],
  { tags: ["gallery"], revalidate: false }
);

// ---- Events (stored as a single JSON blob) ----
const EVENTS_PATH = "site-meta/events.json";

export type EvText = { title: string; place: string; desc: string; fee: string };
export type Ev = {
  id: string;
  date: string;         // 表示用ラベル（任意・上書き）
  deadline: string;     // 表示用ラベル（任意・上書き）
  startDate: string;    // 開催日 "YYYY-MM-DD"（自動非表示などに使用）
  deadlineDate: string; // 応募締め切り "YYYY-MM-DD"
  paused: boolean;      // 一時停止（公開ページに出さない）
  image: string;        // AIに渡す画像（チラシ等・読み取り用。表示画像が無ければ表示にも使う）
  displayImage: string; // 公開カードに表示する画像
  dispX: number;        // 表示画像の焦点 X (0-100 %)
  dispY: number;        // 表示画像の焦点 Y (0-100 %)
  ja: EvText;
  en: EvText;
};

export async function readEvents(): Promise<Ev[]> {
  try {
    const { blobs } = await list({ prefix: EVENTS_PATH });
    const b = blobs.find((x) => x.pathname === EVENTS_PATH);
    if (!b) return [];
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    // normalize so older records (saved before new fields existed) have a full shape
    const txt = (t: any): EvText => ({
      title: t?.title ?? "", place: t?.place ?? "", desc: t?.desc ?? "", fee: t?.fee ?? "",
    });
    return data.map((e: any): Ev => ({
      id: String(e?.id ?? ""),
      date: e?.date ?? "",
      deadline: e?.deadline ?? "",
      startDate: e?.startDate ?? "",
      deadlineDate: e?.deadlineDate ?? "",
      paused: !!e?.paused,
      image: e?.image ?? "",
      displayImage: e?.displayImage ?? "",
      dispX: typeof e?.dispX === "number" ? e.dispX : 50,
      dispY: typeof e?.dispY === "number" ? e.dispY : 50,
      ja: txt(e?.ja), en: txt(e?.en),
    }));
  } catch {
    return [];
  }
}

export async function writeEvents(events: Ev[]): Promise<void> {
  await put(EVENTS_PATH, JSON.stringify(events), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// 公開ページ用（キャッシュ）。時刻依存の締切判定は呼び出し側で行う。
export const getEventsCached = unstable_cache(
  async () => readEvents(),
  ["events-public"],
  { tags: ["events"], revalidate: false }
);
