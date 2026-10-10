"use client";
import { useEffect, useState } from "react";
import { Bi, useLang } from "@/lib/i18n";

// Live events come from the same Supabase the stamp app uses, fetched through
// our own server route (/api/events) to avoid cross-origin issues.
const EVENTS_API = "/api/events";
const APP_URL = "https://stamp-app-two.vercel.app";

export default function Events() {
  const { lang } = useLang();
  const [events, setEvents] = useState<any[] | null>(null);
  const locale = lang === "ja" ? "ja-JP" : "en-US";

  useEffect(() => {
    fetch(EVENTS_API, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setEvents(j.events || []))
      .catch(() => setEvents([]));
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(locale, { month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="イベント" en="Events" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="直近のとなりの集まり。誰でも、ひとりでも、気軽にどうぞ。" en="Upcoming Tonari gatherings. Everyone's welcome — come on your own." />
      </p>

      <div className="mt-10 space-y-3">
        {events === null ? (
          <p className="text-center text-[#a29a8c]"><Bi ja="読み込み中…" en="Loading…" /></p>
        ) : events.length === 0 ? (
          <div className="card text-center">
            <p className="text-ink/80">
              <Bi ja="いま予定されているイベントはありません。SNSやアプリで最新情報をチェックしてください。" en="No events scheduled right now. Check our socials or the app for updates." />
            </p>
            <a href={APP_URL} target="_blank" rel="noreferrer" className="btn btn-ghost mt-4">
              <Bi ja="アプリを開く" en="Open the app" />
            </a>
          </div>
        ) : (
          events.map((e) => (
            <div key={e.id} className={`card flex items-start gap-4 ${e.ended ? "opacity-60" : ""}`}>
              {e.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-mint flex items-center justify-center text-2xl shrink-0">🎉</div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-teal">{fmt(e.starts_at)}{e.ended && <span className="ml-2 text-[#b4ab9b]"><Bi ja="終了" en="Ended" /></span>}</div>
                <h3 className="font-bold text-ink mt-0.5">{lang === "ja" ? e.title_ja : (e.title_en || e.title_ja)}</h3>
                {e.spot && <div className="text-xs text-[#8a8378] mt-0.5">📍 {lang === "ja" ? e.spot.name_ja : (e.spot.name_en || e.spot.name_ja)}</div>}
                {(e.description_ja || e.description_en) && (
                  <p className="text-sm text-ink/70 mt-1 line-clamp-3">{lang === "ja" ? e.description_ja : (e.description_en || e.description_ja)}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
