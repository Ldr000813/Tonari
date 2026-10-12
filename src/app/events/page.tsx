"use client";
import { useEffect, useState } from "react";
import { Bi } from "@/lib/i18n";
import { fmtDate } from "@/lib/eventStatus";

type EvText = { title: string; place: string; desc: string; fee: string };
type Ev = {
  id: string; date: string; deadline: string;
  startDate: string; deadlineDate: string;
  image: string; closed?: boolean; ja: EvText; en: EvText;
};

export default function Events() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j.events)) setEvents(j.events); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="イベント" en="Events" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="となりの集まり。誰でも、ひとりでも、気軽にどうぞ。" en="Tonari gatherings. Everyone's welcome — come on your own." />
      </p>

      <div className="mt-10 space-y-3">
        {loading ? (
          <p className="text-center text-[#a29a8c] text-sm">読み込み中…</p>
        ) : events.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-ink/80">
              <Bi ja="次のイベントは準備中です。最新情報はSNS・LINEでお知らせします。" en="Our next gathering is in the works. Follow us on social media / LINE for updates." />
            </p>
            <a href="/join" className="btn btn-ghost mt-4"><Bi ja="参加のしかたを見る" en="How to join" /></a>
          </div>
        ) : (
          events.map((e) => {
            const dateJa = e.date || fmtDate(e.startDate, "ja");
            const dateEn = e.date || fmtDate(e.startDate, "en");
            const hasDeadline = !!(e.deadline || e.deadlineDate);
            const ddJa = e.deadline ? `締切 ${e.deadline}` : (e.deadlineDate ? `締切 ${fmtDate(e.deadlineDate, "ja")}` : "");
            const ddEn = e.deadline ? `Deadline: ${e.deadline}` : (e.deadlineDate ? `Deadline: ${fmtDate(e.deadlineDate, "en")}` : "");
            return (
              <div key={e.id} className={"card overflow-hidden p-0" + (e.closed ? " opacity-75" : "")}>
                {e.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={e.image} alt="" className={"w-full h-44 object-cover" + (e.closed ? " grayscale-[35%]" : "")} loading="lazy" />
                )}
                <div className="p-5 flex items-start gap-4">
                  {!e.image && <div className="w-14 h-14 rounded-xl bg-mint flex items-center justify-center text-2xl shrink-0">🎉</div>}
                  <div className="min-w-0 flex-1">
                    {(dateJa || dateEn) && <div className="text-xs font-bold text-teal"><Bi ja={dateJa} en={dateEn} /></div>}
                    <h3 className="font-bold text-ink mt-0.5"><Bi ja={e.ja.title} en={e.en.title || e.ja.title} /></h3>
                    {(e.ja.place || e.en.place) && (
                      <div className="text-xs text-[#8a8378] mt-0.5">📍 <Bi ja={e.ja.place} en={e.en.place || e.ja.place} /></div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {e.closed ? (
                        <span className="inline-flex items-center rounded-full bg-[#EFE7D6] text-[#8a8378] text-xs font-bold px-2.5 py-1">
                          <Bi ja="締め切りました" en="Closed" />
                        </span>
                      ) : (
                        <>
                          {(e.ja.fee || e.en.fee) && (
                            <span className="inline-flex items-center rounded-full bg-[#FFF1CC] text-[#8a6d12] text-xs font-bold px-2.5 py-1">
                              💴 <Bi ja={e.ja.fee} en={e.en.fee || e.ja.fee} />
                            </span>
                          )}
                          {hasDeadline && (
                            <span className="inline-flex items-center rounded-full bg-mint text-teal text-xs font-bold px-2.5 py-1">
                              ⏰ <Bi ja={ddJa} en={ddEn} />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {(e.ja.desc || e.en.desc) && (
                      <p className="text-sm text-ink/70 mt-2"><Bi ja={e.ja.desc} en={e.en.desc || e.ja.desc} /></p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
