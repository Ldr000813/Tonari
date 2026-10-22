import { list, put, del } from "@vercel/blob";

// かんたん匿名日程調整。Vercel Blob に JSON として保存（DB不要・使い捨て）。
// 投票は 1 件 1 ファイルにするので、同時投票でも取りこぼしません。

export type Poll = { id: string; title: string; note: string; dates: string[]; createdAt: number };
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

export async function createPoll(p: { title: string; note: string; dates: string[] }): Promise<Poll> {
  const poll: Poll = { id: genId(), createdAt: Date.now(), title: p.title, note: p.note, dates: p.dates };
  await put(`polls/${poll.id}.json`, JSON.stringify(poll), { access: "public", contentType: "application/json", addRandomSuffix: false });
  return poll;
}

export async function getPollMeta(id: string): Promise<Poll | null> {
  const path = `polls/${id}.json`;
  const { blobs } = await list({ prefix: path });
  const b = blobs.find((x) => x.pathname === path);
  return b ? await readJson<Poll>(b.url) : null;
}

export async function getResponses(id: string): Promise<Resp[]> {
  const { blobs } = await list({ prefix: `polls/${id}/r/` });
  const out = await Promise.all(blobs.map((b) => readJson<Resp>(b.url)));
  return (out.filter(Boolean) as Resp[]).sort((a, b) => a.at - b.at);
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
  const out = await Promise.all(metas.map((b) => readJson<Poll>(b.url)));
  return (out.filter(Boolean) as Poll[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePoll(id: string): Promise<void> {
  const { blobs } = await list({ prefix: `polls/${id}` });
  await Promise.all(blobs.map((b) => del(b.url).catch(() => {})));
}
