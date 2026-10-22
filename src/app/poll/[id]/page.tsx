"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Bi } from "@/lib/i18n";

type Pick = "yes" | "maybe" | "no";
type Poll = { id: string; title: string; note: string; dates: string[] };
type Resp = { id: string; name: string; picks: Record<string, Pick> };

const MARK: Record<Pick, string> = { yes: "○", maybe: "△", no: "×" };
const MARK_COLOR: Record<Pick, string> = { yes: "bg-teal text-white", maybe: "bg-yellow text-ink", no: "bg-[#efe7d6] text-[#8a8378]" };

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [responses, setResponses] = useState<Resp[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function load() {
    const r = await fetch(`/api/poll/${id}`, { cache: "no-store" });
    if (r.status === 404) { setNotFound(true); setLoading(false); return; }
    const j = await r.json();
    setPoll(j.poll); setResponses(j.responses || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function submit() {
    if (!poll) return;
    setSending(true);
    const r = await fetch(`/api/poll/${id}/vote`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, picks }),
    });
    setSending(false);
    if (r.ok) { setDone(true); setPicks({}); setName(""); load(); }
  }

  // tally per date
  const tally = useMemo(() => {
    const t: Record<string, { yes: number; maybe: number; no: number }> = {};
    (poll?.dates || []).forEach((d) => (t[d] = { yes: 0, maybe: 0, no: 0 }));
    responses.forEach((r) => poll?.dates.forEach((d) => { const v = r.picks[d]; if (v) t[d][v]++; }));
    return t;
  }, [poll, responses]);

  const best = useMemo(() => {
    if (!poll) return "";
    let top = "", score = -1;
    poll.dates.forEach((d) => { const s = (tally[d]?.yes || 0) * 2 + (tally[d]?.maybe || 0); if (s > score) { score = s; top = d; } });
    return responses.length ? top : "";
  }, [poll, tally, responses.length]);

  if (loading) return <section className="section max-w-xl"><p className="text-center text-[#a29a8c]">読み込み中…</p></section>;
  if (notFound || !poll) return (
    <section className="section max-w-xl text-center">
      <p className="text-ink/80"><Bi ja="この日程調整は見つかりませんでした（削除済みの可能性があります）。" en="This poll was not found (it may have been deleted)." /></p>
    </section>
  );

  return (
    <section className="section max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-black text-ink text-center">{poll.title}</h1>
      {poll.note && <p className="text-center text-sm text-[#8a8378] mt-2 whitespace-pre-wrap">{poll.note}</p>}
      <p className="text-center text-xs text-[#a29a8c] mt-2"><Bi ja="名前は空欄でOK（匿名で回答できます）" en="Name is optional — you can answer anonymously" /></p>

      {/* vote form */}
      <div className="card mt-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="お名前（任意 / optional）"
          className="w-full border border-line rounded-xl p-2.5 text-sm mb-3" />
        <div className="space-y-2">
          {poll.dates.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <span className="flex-1 text-sm font-semibold text-ink">{d}</span>
              {(["yes", "maybe", "no"] as Pick[]).map((v) => (
                <button key={v} type="button" onClick={() => setPicks((p) => ({ ...p, [d]: v }))}
                  className={"w-10 h-10 rounded-lg font-bold text-lg transition-colors " + (picks[d] === v ? MARK_COLOR[v] : "bg-white border border-line text-ink/50 hover:bg-mint")}>
                  {MARK[v]}
                </button>
              ))}
            </div>
          ))}
        </div>
        <button onClick={submit} disabled={sending || !Object.keys(picks).length}
          className="btn btn-primary w-full mt-4 disabled:opacity-50">
          {sending ? "送信中…" : "回答する / Submit"}
        </button>
        {done && <p className="text-teal text-sm text-center mt-3">✅ <Bi ja="回答ありがとうございました！" en="Thanks for your answer!" /></p>}
      </div>

      {/* results */}
      <h2 className="text-lg font-extrabold text-ink mt-10 mb-1"><Bi ja="みんなの回答" en="Everyone's answers" />（{responses.length}）</h2>
      {best && (
        <p className="text-sm text-teal font-bold mb-3"><Bi ja="いまのところ有力：" en="Leading date: " />{best}</p>
      )}
      {responses.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだ回答がありません。最初のひとりになりましょう。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 text-ink/70 font-bold">日程</th>
                <th className="p-2 text-teal">○</th>
                <th className="p-2 text-[#b58a1a]">△</th>
                <th className="p-2 text-[#8a8378]">×</th>
              </tr>
            </thead>
            <tbody>
              {poll.dates.map((d) => (
                <tr key={d} className={"border-t border-line " + (d === best ? "bg-mint/50" : "")}>
                  <td className="p-2 font-semibold text-ink">{d}</td>
                  <td className="p-2 text-center font-bold text-teal">{tally[d]?.yes || 0}</td>
                  <td className="p-2 text-center font-bold text-[#b58a1a]">{tally[d]?.maybe || 0}</td>
                  <td className="p-2 text-center text-[#8a8378]">{tally[d]?.no || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1">
            {responses.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 font-semibold text-ink/80 truncate">{r.name}</span>
                <span className="flex gap-1 flex-wrap">
                  {poll.dates.map((d) => (
                    <span key={d} className="text-[#a29a8c]">{r.picks[d] ? MARK[r.picks[d]] : "・"}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-[#b4ab9b] mt-8">
        <Bi ja="このページのURLを共有すれば、だれでも匿名で回答できます。" en="Share this page's URL — anyone can answer anonymously." />
      </p>
    </section>
  );
}
