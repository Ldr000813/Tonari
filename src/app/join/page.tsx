"use client";
import { Bi } from "@/lib/i18n";

// ▼ ここに実際のリンクを入れてください（未設定なら # のまま非表示扱い）
const LINKS = {
  line: "",              // 例: https://line.me/ti/g/xxxxx
  instagram: "",         // 例: https://instagram.com/xxxx
  app: "https://stamp-app-two.vercel.app",
  contactEmail: "",      // 例: tonari@example.com
};

const steps = [
  { ja: ["アプリを開く", "登録なし・無料。QRを読むだけで始まります。"], en: ["Open the app", "No sign-up, free — just scan a QR to begin."] },
  { ja: ["イベントに参加 or まちを巡る", "気になるイベントへ。お店やスポットも巡れます。"], en: ["Join an event or explore the town", "Join any event, or visit shops and spots."] },
  { ja: ["スタンプを集める", "特典（クーポン）と、新しいつながりをゲット。"], en: ["Collect stamps", "Earn coupons — and new connections."] },
];

export default function Join() {
  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="参加する" en="Join Tonari" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="登録なし・無料。だれでも、ひとりでも歓迎です。" en="No sign-up, free. Everyone's welcome — even on your own." />
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

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <a href={LINKS.app} target="_blank" rel="noreferrer" className="btn btn-primary">
          🎫 <Bi ja="アプリを開く" en="Open the app" />
        </a>
        {LINKS.line && (
          <a href={LINKS.line} target="_blank" rel="noreferrer" className="btn btn-ghost">
            💬 <Bi ja="LINEグループに参加" en="Join our LINE" />
          </a>
        )}
        {LINKS.instagram && (
          <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="btn btn-ghost">
            📷 Instagram
          </a>
        )}
      </div>

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
