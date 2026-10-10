"use client";
import { Bi } from "@/lib/i18n";

// ▼ イベントはここに手で追加できます（新しいものを上に）。
// date は表示用の文字列でOK（例: "10/17 (金) 13:00"）。
type Ev = { date: string; ja: { title: string; place: string; desc: string }; en: { title: string; place: string; desc: string } };
const EVENTS: Ev[] = [
  // {
  //   date: "10/17 (金) 13:00",
  //   ja: { title: "芝生でピクニック交流会", place: "〇〇公園", desc: "音楽を流しながら、ゆるく話そう。" },
  //   en: { title: "Picnic on the grass", place: "〇〇 Park", desc: "Music, snacks and easy conversation." },
  // },
];

export default function Events() {
  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="イベント" en="Events" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="となりの集まり。誰でも、ひとりでも、気軽にどうぞ。" en="Tonari gatherings. Everyone's welcome — come on your own." />
      </p>

      <div className="mt-10 space-y-3">
        {EVENTS.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-ink/80">
              <Bi ja="次のイベントは準備中です。最新情報はSNSでお知らせします。" en="Our next gathering is in the works. Follow us on social media for updates." />
            </p>
            <a href="/join" className="btn btn-ghost mt-4"><Bi ja="参加のしかたを見る" en="How to join" /></a>
          </div>
        ) : (
          EVENTS.map((e, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-mint flex items-center justify-center text-2xl shrink-0">🎉</div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-teal">{e.date}</div>
                <h3 className="font-bold text-ink mt-0.5"><Bi ja={e.ja.title} en={e.en.title} /></h3>
                <div className="text-xs text-[#8a8378] mt-0.5">📍 <Bi ja={e.ja.place} en={e.en.place} /></div>
                <p className="text-sm text-ink/70 mt-1"><Bi ja={e.ja.desc} en={e.en.desc} /></p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
