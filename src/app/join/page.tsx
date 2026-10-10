"use client";
import { Bi } from "@/lib/i18n";

// ▼ ここに実際のリンクを入れてください（空なら自動で非表示）
const LINKS = {
  line: "",              // 例: https://line.me/ti/g/xxxxx
  instagram: "",         // 例: https://instagram.com/xxxx
  contactEmail: "",      // 例: tonari@example.com
};

const steps = [
  { ja: ["SNS・LINEでつながる", "最新のイベント情報は、SNSやLINEでお知らせします。"], en: ["Follow us", "We post event news on social media and LINE."] },
  { ja: ["イベントに来てみる", "気になる回に、ひとりでも、ふらっとどうぞ。"], en: ["Come to an event", "Drop by any gathering — even on your own."] },
  { ja: ["顔を出して、となりに", "一度来たら、もうあなたも“となり”です。"], en: ["Just show up", "Once you come, you're already a neighbor."] },
];

export default function Join() {
  const hasLinks = LINKS.line || LINKS.instagram;
  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="参加する" en="Join Tonari" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="費用なし・予約なし。だれでも、ひとりでも歓迎です。" en="No fee, no booking. Everyone's welcome — even on your own." />
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

      {hasLinks && (
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          {LINKS.line && (
            <a href={LINKS.line} target="_blank" rel="noreferrer" className="btn btn-primary">
              💬 <Bi ja="LINEグループに参加" en="Join our LINE" />
            </a>
          )}
          {LINKS.instagram && (
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="btn btn-ghost">
              📷 Instagram
            </a>
          )}
        </div>
      )}

      {LINKS.contactEmail && (
        <p className="text-center text-sm text-[#8a8378] mt-8">
          <Bi ja="お問い合わせ：" en="Contact: " />
          <a href={`mailto:${LINKS.contactEmail}`} className="text-teal underline">{LINKS.contactEmail}</a>
        </p>
      )}

      <div className="mt-12 rounded-3xl p-8 bg-mint border border-mintline text-center">
        <p className="text-ink/90 font-bold">
          <Bi ja="「海の向こうの人も、自分と何も変わらない」" en="“Even across the sea, we're all the same.”" />
        </p>
        <p className="text-sm text-[#8a8378] mt-2">
          <Bi ja="そう思えた時間を、あなたにも。まずは気軽に、となりへ。" en="We'd love for you to feel that too. Come be a neighbor." />
        </p>
      </div>
    </section>
  );
}
