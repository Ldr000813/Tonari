"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Bi, useLang } from "@/lib/i18n";
import { fmtDate } from "@/lib/eventStatus";
import CalendarMonth, { dayNum, isISO } from "@/components/CalendarMonth";

type Pick = "yes" | "maybe" | "no";
type Poll = { id: string; title: string; note: string; dates: string[]; closed?: boolean };
type Resp = { id: string; name: string; picks: Record<string, Pick> };

const MARK: Record<Pick, string> = { yes: "○", maybe: "△", no: "×" };
const ORDER: (Pick | undefined)[] = [undefined, "yes", "maybe", "no"];

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
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
    setPoll(j.poll); setResponses(j.responses || []); setLoading(false);
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const label = (d: string) => (isISO(d) ? fmtDate(d, lang) : d);
  const allISO = useMemo(() => !!poll && poll.dates.length > 0 && poll.dates.every(isISO), [poll]);
  const candidateSet = useMemo(() => new Set(poll?.dates || []), [poll]);
  const months = useMemo(() => {
    const map = new Map<string, { y: number; m: number }>();
    (poll?.dates || []).filter(isISO).forEach((d) => { const y = +d.slice(0, 4), m = +d.slice(5, 7) - 1; map.set(`${y}-${m}`, { y, m }); });
    return [...map.values()].sort((a, b) => a.y - b.y || a.m - b.m);
  }, [poll]);

  function cycle(iso: string) {
    setPicks((p) => {
      const idx = ORDER.indexOf(p[iso]);
      const nxt = ORDER[(idx + 1) % ORDER.length];
      const np = { ...p };
      if (nxt) np[iso] = nxt; else delete np[iso];
      return np;
    });
  }
  function setPick(iso: string, v: Pick) { setPicks((p) => ({ ...p, [iso]: v })); }

  async function submit() {
    if (!poll) return;
    setSending(true);
    const r = await fetch(`/api/poll/${id}/vote`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, picks }),
    });
    setSending(false);
    if (r.ok) { setDone(true); setPicks({}); setName(""); load(); }
    else if (r.status === 403) { alert("この日程調整は締め切られました。 / This poll is closed."); load(); }
  }

  const tally = useMemo(() => {
    const t: Record<string, { yes: number; maybe: number; no: number }> = {};
    (poll?.dates || []).forEach((d) => (t[d] = { yes: 0, maybe: 0, no: 0 }));
    responses.forEach((r) => poll?.dates.forEach((d) => { const v = r.picks[d]; if (v) t[d][v]++; }));
    return t;
  }, [poll, responses]);
  const best = useMemo(() => {
    if (!poll || !responses.length) return "";
    let top = "", score = -1;
    poll.dates.forEach((d) => { const s = (tally[d]?.yes || 0) * 2 + (tally[d]?.maybe || 0); if (s > score) { score = s; top = d; } });
    return top;
  }, [poll, tally, responses.length]);

  if (loading) return <section className="section max-w-xl"><p className="text-center text-[#a29a8c]">読み込み中… / Loading…</p></section>;
  if (notFound || !poll) return (
    <section className="section max-w-xl text-center">
      <p className="text-ink/80"><Bi ja="この日程調整は見つかりませんでした（削除済みの可能性があります）。" en="This poll was not found (it may have been deleted)." /></p>
    </section>
  );

  function pickBtnClass(v: Pick | undefined) {
    return v === "yes" ? "bg-teal text-white" : v === "maybe" ? "bg-yellow text-ink" : v === "no" ? "bg-[#e6ddcb] text-[#8a8378]" : "bg-white border border-teal/40 text-ink";
  }

  return (
    <section className="section max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-black text-ink text-center">{poll.title}</h1>
      {poll.note && <p className="text-center text-sm text-[#8a8378] mt-2 whitespace-pre-wrap">{poll.note}</p>}

      {poll.closed && (
        <div className="mt-4 rounded-2xl bg-[#FADCDC] border border-[#f0b9b9] text-center p-3">
          <p className="font-bold text-[#b4474a]"><Bi ja="この日程調整は締め切られました。" en="This poll has been closed." /></p>
          <p className="text-xs text-[#8a8378] mt-1"><Bi ja="結果は下でご覧いただけます。" en="You can still see the results below." /></p>
        </div>
      )}

      {/* legend */}
      {!poll.closed && (
        <div className="flex justify-center gap-3 text-xs font-bold mt-4">
          <span className="text-teal">○ <Bi ja="行ける" en="Can go" /></span>
          <span className="text-[#b58a1a]">△ <Bi ja="たぶん" en="Maybe" /></span>
          <span className="text-[#8a8378]">× <Bi ja="むずかしい" en="Can't" /></span>
        </div>
      )}

      {!poll.closed && (
      <div className="card mt-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="お名前（任意 / optional）"
          className="w-full border border-line rounded-xl p-2.5 text-sm mb-4" />

        {allISO ? (
          <>
            <p className="text-xs text-[#8a8378] mb-3 text-center">
              <Bi ja="候補日をタップ。もう一度タップで ○ → △ → × と切り替わります。" en="Tap a highlighted day. Tap again to cycle ○ → △ → ×." />
            </p>
            <div className="space-y-6 max-w-xs mx-auto">
              {months.map(({ y, m }) => (
                <CalendarMonth key={`${y}-${m}`} y={y} m={m} nav={false}
                  cell={(iso) => {
                    if (!candidateSet.has(iso)) return <div className="w-full h-full grid place-items-center text-[11px] text-[#d8d0bf]">{dayNum(iso)}</div>;
                    const v = picks[iso];
                    return (
                      <button type="button" onClick={() => cycle(iso)}
                        className={"w-full h-full rounded-lg text-sm font-bold flex flex-col items-center justify-center leading-none " + pickBtnClass(v)}>
                        <span>{dayNum(iso)}</span>
                        {v && <span className="text-[10px] mt-0.5">{MARK[v]}</span>}
                      </button>
                    );
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          // 旧形式（自由入力の候補）向けフォールバック
          <div className="space-y-2">
            {poll.dates.map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span className="flex-1 text-sm font-semibold text-ink">{d}</span>
                {(["yes", "maybe", "no"] as Pick[]).map((v) => (
                  <button key={v} type="button" onClick={() => setPick(d, v)}
                    className={"w-10 h-10 rounded-lg font-bold text-lg " + (picks[d] === v ? pickBtnClass(v) : "bg-white border border-line text-ink/50 hover:bg-mint")}>
                    {MARK[v]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        <button onClick={submit} disabled={sending || !Object.keys(picks).length}
          className="btn btn-primary w-full mt-5 disabled:opacity-50">
          {sending ? "送信中…" : "回答する / Submit"}
        </button>
        {done && <p className="text-teal text-sm text-center mt-3">✅ <Bi ja="回答ありがとうございました！" en="Thanks for your answer!" /></p>}
      </div>
      )}

      {/* results */}
      <h2 className="text-lg font-extrabold text-ink mt-10 mb-1"><Bi ja="みんなの回答" en="Everyone's answers" />（{responses.length}）</h2>
      {best && <p className="text-sm text-teal font-bold mb-3"><Bi ja="いまのところ有力：" en="Leading: " />{label(best)}</p>}
      {responses.length === 0 ? (
        <p className="text-[#a29a8c] text-sm"><Bi ja="まだ回答がありません。最初のひとりになりましょう。" en="No answers yet — be the first!" /></p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 text-ink/70 font-bold"><Bi ja="日程" en="Date" /></th>
                <th className="p-2 text-teal">○</th><th className="p-2 text-[#b58a1a]">△</th><th className="p-2 text-[#8a8378]">×</th>
              </tr>
            </thead>
            <tbody>
              {poll.dates.map((d) => (
                <tr key={d} className={"border-t border-line " + (d === best ? "bg-mint/50" : "")}>
                  <td className="p-2 font-semibold text-ink">{label(d)}</td>
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
                  {poll.dates.map((d) => <span key={d} className="text-[#a29a8c]">{r.picks[d] ? MARK[r.picks[d]] : "・"}</span>)}
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
