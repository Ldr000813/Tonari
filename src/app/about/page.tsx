"use client";
import { Bi } from "@/lib/i18n";

const benefits = [
  { key: "lang", ja: ["語学が自然に伸びる", "教室じゃなく、会話の中で。英語も日本語も、使うから身につく。"], en: ["Languages grow naturally", "Not in a classroom — through real talk. English and Japanese alike."] },
  { key: "friends", ja: ["海外の友達ができる", "観光では出会えない、続いていく“ほんとうの友達”。"], en: ["Friends from abroad", "Real friends you'd never meet as a tourist."] },
  { key: "global", ja: ["視野と考え方が広がる", "ちがう“当たり前”に触れて、世界の見え方が変わる。"], en: ["See the world differently", "Meet other 'normals' and widen how you think."] },
  { key: "fun", ja: ["とにかく楽しい・刺激的", "毎回ちがう文化と出会える。日常が、ちょっと冒険に。"], en: ["Simply fun & fresh", "A new culture every time — everyday life gets exciting."] },
  { key: "hangout", ja: ["気軽に遊べる仲間ができる", "ひとりでも大丈夫。ゆるくつながれる居場所。"], en: ["People to hang out with", "Come alone — a relaxed place to belong."] },
  { key: "self", ja: ["自分の文化に気づく", "誰かに話すうちに、自分の国や街の良さを再発見。"], en: ["Rediscover your roots", "Explaining your culture helps you see its value."] },
];

const tints = [
  "bg-mint text-teal",
  "bg-[#FFF1CC] text-[#9a6b12]",
  "bg-[#E7E9FF] text-[#5b63c4]",
  "bg-[#FADFE4] text-[#c24a6e]",
  "bg-[#D9F2EA] text-teal",
  "bg-[#FFE6D4] text-[#c9603c]",
];

function Ico({ name }: { name: string }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "w-6 h-6" };
  if (name === "lang") return (
    <svg {...p}><path d="M3.5 6.5h11a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9l-4 3v-3H3.5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
      <circle cx="7" cy="10" r=".6" fill="currentColor" /><circle cx="10" cy="10" r=".6" fill="currentColor" /><circle cx="13" cy="10" r=".6" fill="currentColor" /></svg>
  );
  if (name === "friends") return (<svg {...p}><circle cx="9.3" cy="12" r="4.6" /><circle cx="14.7" cy="12" r="4.6" /></svg>);
  if (name === "global") return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3.2 2.7 3.2 15.3 0 18M12 3c-3.2 2.7-3.2 15.3 0 18" /></svg>);
  if (name === "fun") return (<svg {...p}><path d="M12 3c.7 4.3 1.7 5.3 5.8 6-4.1.7-5.1 1.7-5.8 6-.7-4.3-1.7-5.3-5.8-6 4.1-.7 5.1-1.7 5.8-6z" /></svg>);
  if (name === "hangout") return (<svg {...p}><circle cx="8.5" cy="8.5" r="2.2" /><circle cx="15.5" cy="8.5" r="2.2" /><path d="M4.5 18c0-2.3 1.8-3.8 4-3.8s4 1.5 4 3.8" /><path d="M11.5 18c0-2.3 1.8-3.8 4-3.8s4 1.5 4 3.8" /></svg>);
  return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2.2 5.3L8 16l2.2-5.3L15.5 8.5z" /></svg>); // self / compass
}

export default function About() {
  return (
    <>
      <section className="section">
        <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
          <Bi ja="となりとは" en="About Tonari" />
        </h1>
        <p className="lead mt-3">
          <Bi
            ja="留学生も、大学生・高校生も、社会人も、地域の人も。国や立場をこえて対等に出会い、言語交換やごはん、まち歩きを楽しむ——人を大事にする、あたたかい異文化共生のコミュニティです。"
            en="Students, working people and locals alike — meeting as equals beyond country or status, enjoying language exchange, meals and town walks. A warm, people-first community for living across cultures."
          />
        </p>
      </section>

      {/* problem */}
      <section className="section pt-0">
        <div className="card">
          <p className="text-ink/90">
            <Bi
              ja="日本は少子高齢化が進み、外国人材の受け入れはもう欠かせません。でも実際には、多くの外国人が「日本にいるのに、日本社会には入れていない」という孤立を抱えています。地域の人も、どう関わればいいか距離感がつかめずにいる。これは外国人だけの問題ではなく、双方の課題です。"
              en="As Japan ages, welcoming people from abroad has become essential. Yet many feel they're in Japan but not quite 'in' it, while locals aren't sure how to connect. This isn't only a newcomer's problem — it's a shared one."
            />
          </p>
        </div>
      </section>

      {/* mutual benefit */}
      <section className="section pt-0">
        <h2 className="h2"><Bi ja="大事にしているのは、“相互メリット”" en="Built on mutual benefit" /></h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="rounded-3xl p-6 bg-[#FFF6DC] border border-[#F0DFA0]">
            <h3 className="font-bold mb-2"><Bi ja="外国人にとって" en="For newcomers" /></h3>
            <p className="text-sm text-ink/80"><Bi ja="孤立が解消され、相互理解と語学が育ち、安心して日本社会に定着できる。" en="Less isolation, real understanding, and a place to settle with confidence." /></p>
          </div>
          <div className="rounded-3xl p-6 bg-mint border border-mintline">
            <h3 className="font-bold mb-2"><Bi ja="地域の人にとって" en="For locals" /></h3>
            <p className="text-sm text-ink/80"><Bi ja="身近に世界とつながれて視野が広がり、人手不足の解消や地域の国際化にもつながる。" en="A wider view of the world close to home — and help with labor shortages and local vibrancy." /></p>
          </div>
        </div>

        {/* personal benefits */}
        <h3 className="text-center text-xl sm:text-2xl font-extrabold text-ink mt-14">
          <Bi ja="参加すると、こんないいこと" en="What you'll get out of it" />
        </h3>
        <p className="lead !mt-2"><Bi ja="国がちがっても、得られるものはみんな同じ。" en="Whoever you are, there's something here for you." /></p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8">
          {benefits.map((b, i) => (
            <div key={b.key} className="card p-5">
              <span className={"grid place-items-center w-12 h-12 rounded-2xl " + tints[i % tints.length]}>
                <Ico name={b.key} />
              </span>
              <h4 className="font-bold text-ink mt-3"><Bi ja={b.ja[0]} en={b.en[0]} /></h4>
              <p className="text-sm text-ink/70 mt-1 leading-relaxed"><Bi ja={b.ja[1]} en={b.en[1]} /></p>
            </div>
          ))}
        </div>
      </section>

      {/* vision */}
      <section className="section pt-0">
        <div className="rounded-3xl p-8 bg-mint border border-mintline text-center">
          <p className="text-ink/90 max-w-2xl mx-auto">
            <Bi
              ja="どの街にも“最初に頼れる隣人（となり）”がある社会を。京田辺市から、やがて全国の各地域へ。外国人の帰属意識と、地域のグローバルな意識を同時に高め、文化摩擦を減らしていきます。"
              en="A society where every town has a 'next-door neighbor' you can rely on. From Kyotanabe to all of Japan — raising belonging and global openness together, and easing cultural friction."
            />
          </p>
        </div>
      </section>
    </>
  );
}
