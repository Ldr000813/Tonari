"use client";
import { useEffect, useState } from "react";
import { Bi } from "@/lib/i18n";
import HeroSlideshow, { HeroImage } from "@/components/HeroSlideshow";

// Shown until the admin has uploaded photos (and as a fallback).
const defaultHero: HeroImage[] = [
  { url: "/events/e1.jpg", pos: "50% 50%" },
  { url: "/events/e2.jpg", pos: "50% 50%" },
  { url: "/events/e3.jpg", pos: "50% 50%" },
  { url: "/events/e4.jpg", pos: "50% 50%" },
];

const doing = [
  { key: "lang", ja: ["言語別のフリートーク", "英語・日本語・中国語…話したい言語のテーブルで、気軽におしゃべり。言語交換も、ここから。"], en: ["Free-talk by language", "Sit at the table for the language you want — English, Japanese, Chinese… Language exchange starts here."] },
  { key: "meal", ja: ["ホームパーティ・ごはん", "みんなで料理して、同じ食卓を囲む。母国の味を持ち寄るのも楽しい。"], en: ["Home parties & meals", "Cook together and share a table. Bring a dish from your home country, too."] },
  { key: "town", ja: ["観光スポット巡り・まち歩き", "京都・京田辺のいいところを一緒に。歩きながら、自然と仲良くなれます。"], en: ["Sightseeing & town walks", "Explore the best of Kyoto & Kyotanabe together — and get close while you walk."] },
  { key: "friends", ja: ["対等な友だちになる", "「教える・教わる」じゃなく、ただの友だち。イベントのあとも、関係は続いていきます。"], en: ["Become real friends", "Not teacher and student — just friends. Bonds that keep going after the event ends."] },
];

function Ico({ name }: { name: string }) {
  const p = {
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className: "w-6 h-6",
  };
  if (name === "lang") return (
    <svg {...p}><path d="M3.5 6.5h11a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9l-4 3v-3H3.5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
      <circle cx="7" cy="10" r=".6" fill="currentColor" /><circle cx="10" cy="10" r=".6" fill="currentColor" /><circle cx="13" cy="10" r=".6" fill="currentColor" /></svg>
  );
  if (name === "gather") return (
    <svg {...p}><circle cx="8.5" cy="8.5" r="2.2" /><circle cx="15.5" cy="8.5" r="2.2" />
      <path d="M4.5 18c0-2.3 1.8-3.8 4-3.8s4 1.5 4 3.8" /><path d="M11.5 18c0-2.3 1.8-3.8 4-3.8s4 1.5 4 3.8" /></svg>
  );
  if (name === "meal") return (
    <svg {...p}><path d="M3.5 11.5h17" /><path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M9.4 5c.6.6-.6 1.2 0 1.9" /><path d="M14 5c.6.6-.6 1.2 0 1.9" /></svg>
  );
  if (name === "friends") return (
    <svg {...p}><circle cx="9.3" cy="12" r="4.6" /><circle cx="14.7" cy="12" r="4.6" /></svg>
  );
  return ( // town
    <svg {...p}><path d="M3 20v-6l4-3 4 3v6" /><path d="M11 20V10.5l5-3.5 5 3.5V20" /><path d="M2.5 20h19" /></svg>
  );
}

export default function Home() {
  // Start empty (dark hero) and only show photos once we know what to display —
  // this avoids briefly flashing the bundled fallback before the admin photos load.
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  useEffect(() => {
    fetch("/api/hero", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setHeroImages(Array.isArray(j.images) && j.images.length ? j.images : defaultHero))
      .catch(() => setHeroImages(defaultHero));
  }, []);

  return (
    <>
      {/* hero: flowing past-event photos + overlay */}
      <section className="relative h-[72vh] min-h-[460px] flex items-center justify-center text-center overflow-hidden">
        <HeroSlideshow images={heroImages} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55" />
        <div className="relative z-10 px-5 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight drop-shadow">
            <Bi ja="海の向こうも、となりだった。" en="Even across the sea, we're neighbors." />
          </h1>
          <p className="max-w-xl mx-auto mt-4 text-white/90 font-medium drop-shadow">
            <Bi
              ja="留学生も、大学生・高校生も、社会人も、地域の人も。国や立場がちがっても、人として対等に。言語交換・ごはん・まち歩きを楽しむ、あたたかい異文化共生コミュニティです。"
              en="Students, working people, locals — everyone welcome. Language exchange, meals and town walks, a warm multicultural community where we meet simply as equals."
            />
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <a href="/join" className="btn bg-yellow text-ink shadow-lg">
              <Bi ja="参加する" en="Join us" />
            </a>
            <a href="/about" className="btn bg-white/15 text-white border border-white/60 backdrop-blur">
              <Bi ja="となりとは" en="About" />
            </a>
          </div>
        </div>
      </section>

      {/* what it is */}
      <section className="section">
        <div className="bg-mint border border-mintline rounded-3xl p-8 text-center">
          <p className="text-lg font-extrabold text-teal mb-2">
            <Bi ja="語学“だけ”の場所じゃ、ありません。" en="More than just language." />
          </p>
          <p className="max-w-2xl mx-auto text-[15px] text-ink/90">
            <Bi
              ja="言語交換（言語別のフリートーク）もやります。でも何より大事にしているのは、“人”。留学生も、地域の人も、社会人も高校生も、国や年齢をこえて対等に出会い、ごはんを囲んだり、まちを歩いたりしながら、ゆっくり友だちになっていく。語学も友情も、その中で自然に育ちます。"
              en="Yes, we do language exchange (free-talk by language). But what we care about most is people. Students, locals, working people — meeting as equals across country and age, sharing meals and walks, slowly becoming friends. Language and friendship grow naturally along the way."
            />
          </p>
        </div>
      </section>

      {/* what you can do */}
      <section className="section pt-0">
        <h2 className="h2"><Bi ja="となりでやっていること" en="What we actually do" /></h2>
        <p className="lead"><Bi ja="むずかしく考えなくて大丈夫。楽しいから、また来たくなる。それだけです。" en="No need to overthink it. It's fun, so people come back. That's really all." /></p>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
          {doing.map((c) => (
            <div key={c.key} className="card p-5 flex items-start gap-4">
              <span className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl bg-mint text-teal">
                <Ico name={c.key} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-ink"><Bi ja={c.ja[0]} en={c.en[0]} /></h3>
                <p className="text-sm text-ink/70 mt-1 leading-relaxed"><Bi ja={c.ja[1]} en={c.en[1]} /></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* who it's for */}
      <section className="section pt-0">
        <h2 className="h2"><Bi ja="こんな人へ" en="Who it's for" /></h2>
        <p className="lead"><Bi ja="留学生も、大学生・高校生も、社会人も、地域の人も。異文化共生に興味がある人なら、どなたでも大歓迎。" en="Students, working people, locals — anyone curious about living across cultures is welcome." /></p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="rounded-3xl p-6 bg-[#FFF6DC] border border-[#F0DFA0]">
            <h3 className="font-bold">🌏 <Bi ja="海外から来た方・留学生へ" en="If you've come from abroad" /></h3>
            <p className="text-sm text-ink/80 mt-2">
              <Bi ja="日本に住んでいるのに、どこか「お客さん」のまま。そんな感じがするなら、一度のぞいてみてください。ここでは外国人としてじゃなく、ただのあなたとして会えます。" en="Living in Japan, but still somehow a 'guest'? If that sounds familiar, come take a look. Here you're not 'the foreigner' — just you." />
            </p>
          </div>
          <div className="rounded-3xl p-6 bg-mint border border-mintline">
            <h3 className="font-bold">🍵 <Bi ja="日本の学生・社会人・地域の方へ" en="If you're local — student, worker or resident" /></h3>
            <p className="text-sm text-ink/80 mt-2">
              <Bi ja="海外の人と話してみたい、視野を広げたい、ただ楽しい仲間がほしい。どんな入り口でも大丈夫。英語に自信がなくても、身構えず、ふつうに友だちになれます。" en="Want to meet people from abroad, widen your view, or just find fun friends? Any reason works. No English confidence needed — just come as you are." />
            </p>
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="section pt-0">
        <div className="rounded-3xl p-10 text-center" style={{ background: "linear-gradient(160deg,#BFE8DF,#F6C64B)" }}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            <Bi ja="まずは、のぞいてみませんか？" en="Why not take a look?" />
          </h2>
          <p className="text-ink/80 max-w-md mx-auto mt-2 mb-6">
            <Bi ja="あなたの“最初の隣人”が、ここで見つかります。" en="Your first neighbor in this town is waiting here." />
          </p>
          <a href="/join" className="btn btn-primary">
            <Bi ja="参加する" en="Join us" />
          </a>
        </div>
      </section>
    </>
  );
}
