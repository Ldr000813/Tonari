"use client";
import { Bi } from "@/lib/i18n";

// ▼ リンク設定（空なら自動で非表示）
const LINKS = {
  lineOpenChat: "https://line.me/ti/g2/WkLDprTxGsN5DOolD9eDwdhbH4iRbMYrJixBPA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
  instagram: "",         // 例: https://instagram.com/xxxx
  contactEmail: "",      // 例: tonari@example.com
};

const steps = [
  { ja: ["SNS・LINEでつながる", "最新のイベント情報は、SNSやLINEでお知らせします。"], en: ["Follow us", "We post event news on social media and LINE."] },
  { ja: ["イベントに来てみる", "気になる回に、ひとりでも、ふらっとどうぞ。"], en: ["Come to an event", "Drop by any gathering — even on your own."] },
  { ja: ["顔を出して、となりに", "一度来たら、もうあなたも“となり”です。"], en: ["Just show up", "Once you come, you're already a neighbor."] },
];

export default function Join() {
  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="参加する" en="Join Tonari" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="費用は原則なし・予約なし。だれでも、ひとりでも歓迎です。" en="Usually free, no booking. Everyone's welcome — even on your own." />
      </p>

      <div className="mt-10 max-w-xl mx-auto space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="card flex items-start gap-4">
            <span className="shrink-0 w-9 h-9 rounded-full bg-yellow text-ink font-black flex items-center justify-center">{i + 1}</span>
            <div>
              <b className="block text-ink"><Bi ja={s.ja[0]} en={s.en[0]} /></b>
              <span className="text-sm text-[#8a8378]"><Bi ja={s.ja[1]} en={s.en[1]} /></span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl p-8 bg-mint border border-mintline text-center">
        <p className="text-ink/90 font-bold">
          <Bi ja="「海の向こうの人も、自分と何も変わらない」" en="“Even across the sea, we're all the same.”" />
        </p>
        <p className="text-sm text-[#8a8378] mt-2">
          <Bi ja="そう思えた時間を、あなたにも。まずは気軽に、となりへ。" en="We'd love for you to feel that too. Come be a neighbor." />
        </p>
      </div>

      {/* LINE open chat CTA */}
      <div className="mt-10 max-w-md mx-auto text-center">
        <p className="text-sm text-[#8a8378] mb-3">
          <Bi ja="まずはLINEのオープンチャットから。無料で、すぐ参加できます。" en="Start with our LINE open chat — free, join in seconds." />
        </p>
        <a
          href={LINKS.lineOpenChat}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#06C755] text-white font-bold py-3.5 shadow-md active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 5.73 2 10.33c0 4.12 3.58 7.57 8.41 8.22.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.01.89.55 1.09-.46 5.86-3.45 8-5.91C21.4 14.03 22 12.26 22 10.33 22 5.73 17.52 2 12 2zM8.3 12.9H6.36c-.28 0-.51-.23-.51-.51V8.5c0-.28.23-.5.51-.5.29 0 .52.22.52.5v3.38H8.3c.29 0 .51.23.51.51s-.22.51-.51.51zm2.02-.51c0 .28-.23.51-.52.51-.28 0-.51-.23-.51-.51V8.5c0-.28.23-.5.51-.5.29 0 .52.22.52.5v3.89zm4.68 0c0 .22-.14.42-.36.49-.05.02-.11.03-.16.03-.16 0-.31-.08-.41-.21l-1.99-2.71v2.4c0 .28-.23.51-.52.51-.28 0-.51-.23-.51-.51V8.5c0-.22.14-.41.35-.48.06-.02.11-.03.17-.03.16 0 .31.08.41.21l1.99 2.71V8.5c0-.28.23-.5.52-.5.28 0 .51.22.51.5v3.89zm3.28-2.46c.28 0 .51.23.51.51s-.23.51-.51.51h-1.42v.92h1.42c.28 0 .51.23.51.51s-.23.51-.51.51h-1.93c-.28 0-.51-.23-.51-.51V8.5c0-.28.23-.5.51-.5h1.93c.28 0 .51.22.51.5s-.23.51-.51.51h-1.42v.92h1.42z"/>
          </svg>
          <Bi ja="LINEオープンチャット「となり」に参加" en='Join LINE open chat "Tonari"' />
        </a>

        {LINKS.instagram && (
          <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-teal underline">
            📷 Instagram
          </a>
        )}
        {LINKS.contactEmail && (
          <p className="text-sm text-[#8a8378] mt-3">
            <Bi ja="お問い合わせ：" en="Contact: " />
            <a href={`mailto:${LINKS.contactEmail}`} className="text-teal underline">{LINKS.contactEmail}</a>
          </p>
        )}
      </div>
    </section>
  );
}
