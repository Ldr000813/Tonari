import { list, put, del } from "@vercel/blob";
import { unstable_cache } from "next/cache";

// かんたん匿名日程調整。Vercel Blob に JSON として保存（DB不要・使い捨て）。
// 投票は 1 件 1 ファイルにするので、同時投票でも取りこぼしません。

export type Poll = { id: string; title: string; note: string; dates: string[]; createdAt: number; closed: boolean };
export type Pick = "yes" | "maybe" | "no";
export type Resp = { id: string; name: string; picks: Record<string, Pick>; at: number };

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function readJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

function norm(p: any): Poll | null {
  if (!p) return null;
  return { id: String(p.id), title: p.title ?? "", note: p.note ?? "", dates: Array.isArray(p.dates) ? p.dates : [], createdAt: p.createdAt ?? 0, closed: !!p.closed };
}

export async function createPoll(p: { title: string; note: string; dates: string[] }): Promise<Poll> {
  const poll: Poll = { id: genId(), createdAt: Date.now(), closed: false, title: p.title, note: p.note, dates: p.dates };
  await put(`polls/${poll.id}.json`, JSON.stringify(poll), { access: "public", contentType: "application/json", addRandomSuffix: false });
  return poll;
}

export async function getPollMeta(id: string): Promise<Poll | null> {
  const path = `polls/${id}.json`;
  const { blobs } = await list({ prefix: path });
  const b = blobs.find((x) => x.pathname === path);
  return b ? norm(await readJson<any>(b.url)) : null;
}

export async function setPollClosed(id: string, closed: boolean): Promise<boolean> {
  const meta = await getPollMeta(id);
  if (!meta) return false;
  await put(`polls/${id}.json`, JSON.stringify({ ...meta, closed }), { access: "public", contentType: "application/json", addRandomSuffix: false });
  return true;
}

export async function updatePoll(
  id: string,
  fields: Partial<{ title: string; note: string; dates: string[]; closed: boolean }>,
): Promise<Poll | null> {
  const meta = await getPollMeta(id);
  if (!meta) return null;
  const next: Poll = {
    ...meta,
    ...(fields.title !== undefined ? { title: String(fields.title).slice(0, 120) } : {}),
    ...(fields.note !== undefined ? { note: String(fields.note).slice(0, 300) } : {}),
    ...(fields.dates !== undefined ? { dates: fields.dates.map((d) => String(d).slice(0, 80)).filter(Boolean).slice(0, 30) } : {}),
    ...(fields.closed !== undefined ? { closed: !!fields.closed } : {}),
  };
  await put(`polls/${id}.json`, JSON.stringify(next), { access: "public", contentType: "application/json", addRandomSuffix: false });
  return next;
}

export async function getResponses(id: string): Promise<Resp[]> {
  const { blobs } = await list({ prefix: `polls/${id}/r/` });
  const out = await Promise.all(blobs.map((b) => readJson<Resp>(b.url)));
  return (out.filter(Boolean) as Resp[]).sort((a, b) => a.at - b.at);
}

// 公開の投票ページ用（キャッシュ）。投票/編集時は revalidateTag(`poll-<id>`) で更新。
export function getPollView(id: string) {
  return unstable_cache(
    async () => {
      const poll = await getPollMeta(id);
      if (!poll) return null;
      const responses = await getResponses(id);
      return { poll, responses };
    },
    ["poll-view", id],
    { tags: [`poll-${id}`], revalidate: false } // 投票/編集のときだけ作り直す
  )();
}

export async function addResponse(id: string, resp: { name: string; picks: Record<string, Pick> }): Promise<void> {
  const rid = genId();
  await put(`polls/${id}/r/${rid}.json`, JSON.stringify({ id: rid, at: Date.now(), name: resp.name, picks: resp.picks }), {
    access: "public", contentType: "application/json", addRandomSuffix: false,
  });
}

export async function listPolls(): Promise<Poll[]> {
  const { blobs } = await list({ prefix: "polls/" });
  const metas = blobs.filter((b) => /^polls\/[^/]+\.json$/.test(b.pathname));
  const out = await Promise.all(metas.map((b) => readJson<any>(b.url)));
  return (out.map(norm).filter(Boolean) as Poll[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePoll(id: string): Promise<void> {
  const { blobs } = await list({ prefix: `polls/${id}` });
  await Promise.all(blobs.map((b) => del(b.url).catch(() => {})));
}
