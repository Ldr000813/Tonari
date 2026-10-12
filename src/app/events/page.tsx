"use client";
import { useEffect, useState } from "react";
import { Bi } from "@/lib/i18n";

type EvText = { title: string; place: string; desc: string };
type Ev = { id: string; date: string; ja: EvText; en: EvText };

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
          events.map((e) => (
            <div key={e.id} className="card flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-mint flex items-center justify-center text-2xl shrink-0">🎉</div>
              <div className="min-w-0">
                {e.date && <div className="text-xs font-bold text-teal">{e.date}</div>}
                <h3 className="font-bold text-ink mt-0.5"><Bi ja={e.ja.title} en={e.en.title || e.ja.title} /></h3>
                {(e.ja.place || e.en.place) && (
                  <div className="text-xs text-[#8a8378] mt-0.5">📍 <Bi ja={e.ja.place} en={e.en.place || e.ja.place} /></div>
                )}
                {(e.ja.desc || e.en.desc) && (
                  <p className="text-sm text-ink/70 mt-1"><Bi ja={e.ja.desc} en={e.en.desc || e.ja.desc} /></p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
