"use client";
import { Bi } from "@/lib/i18n";

const doing = [
  { ic: "🎉", ja: ["イベントで出会う", "料理・お祭り・まち歩き。ひとりでも気軽に。"], en: ["Meet at events", "Cooking, festivals, town walks — come on your own."] },
  { ic: "🍚", ja: ["ごはんを囲む", "同じ食卓で、肩の力を抜いて話す。"], en: ["Share a meal", "Around the same table, with the pressure off."] },
  { ic: "🤝", ja: ["対等な友だちができる", "言語交換で終わらない、続く関係。"], en: ["Make real friends", "Not just language exchange — bonds that last."] },
  { ic: "🏠", ja: ["この街の一員になる", "困ったとき、隣にいてくれる人ができる。"], en: ["Belong here", "Find people who are there when you need them."] },
];

export default function Home() {
  return (
    <>
      {/* hero */}
      <section className="relative text-center px-5 pt-16 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#FCE8B2 0%,#F6C64B 45%,#BFE8DF 120%)" }}>
        <span className="inline-block bg-white text-teal font-bold text-xs rounded-full px-4 py-1.5 shadow-sm">
          <Bi ja="多文化共生コミュニティ" en="Multicultural Community" />
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-ink mt-5 leading-tight">
          <Bi ja="海の向こうも、となりだった。" en="Even across the sea, we're neighbors." />
        </h1>
        <p className="max-w-xl mx-auto mt-4 text-ink/80 font-medium">
          <Bi
            ja="在日外国人・留学生と、地域の人が“半々・対等”に出会う場所。国がちがっても、人として、となりあう。"
            en="Where international residents, students and locals meet — half and half, as equals."
          />
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8 relative z-10">
          <a href="/join" className="btn btn-primary">
            <Bi ja="参加する" en="Join us" />
          </a>
          <a href="/about" className="btn btn-ghost"><Bi ja="となりとは" en="About" /></a>
        </div>
      </section>

      {/* what it is */}
      <section className="section">
        <div className="bg-mint border border-mintline rounded-3xl p-8 text-center">
          <p className="text-lg font-extrabold text-teal mb-2">
            <Bi ja="語学を学ぶ場所では、ありません。" en="This is not a language school." />
          </p>
          <p className="max-w-2xl mx-auto text-[15px] text-ink/90">
            <Bi
              ja="「同じ人として尊重し合う」ことから始める場所です。一緒にイベントを楽しんだり、まちを巡ったりするうちに、自然と語学力も、友だちも、この街への愛着も育っていく。外国人も、地域の人も、どちらも“得をする”。それがとなりです。"
              en="A place that starts from respecting each other simply as people. Through events and exploring the town together, language, friends and a sense of belonging grow naturally — and both newcomers and locals gain something."
            />
          </p>
        </div>
      </section>

      {/* what you can do */}
      <section className="section pt-0">
        <h2 className="h2"><Bi ja="となりでできること" en="What you can do" /></h2>
        <p className="lead"><Bi ja="気軽に、楽しく。難しいことは何もありません。" en="Easygoing and fun — nothing complicated." /></p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {doing.map((c, i) => (
            <div key={i} className="card">
              <div className="text-3xl">{c.ic}</div>
              <h3 className="font-bold text-ink mt-3"><Bi ja={c.ja[0]} en={c.en[0]} /></h3>
              <p className="text-sm text-ink/70 mt-1"><Bi ja={c.ja[1]} en={c.en[1]} /></p>
            </div>
          ))}
        </div>
      </section>

      {/* who it's for */}
      <section className="section pt-0">
        <h2 className="h2"><Bi ja="こんな人へ" en="Who it's for" /></h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="rounded-3xl p-6 bg-[#FFF6DC] border border-[#F0DFA0]">
            <h3 className="font-bold">🌏 <Bi ja="外国から来た方・留学生へ" en="International residents & students" /></h3>
            <p className="text-sm text-ink/80 mt-2">
              <Bi ja="「日本にいるのに、入れていない」と感じるあなたへ。ここでは、一人の人として迎えられます。" en="For you who feel you're in Japan yet not quite 'in'. Here, you're welcomed as a person." />
            </p>
          </div>
          <div className="rounded-3xl p-6 bg-mint border border-mintline">
            <h3 className="font-bold">🍵 <Bi ja="地域にお住まいの方へ" en="Local residents" /></h3>
            <p className="text-sm text-ink/80 mt-2">
              <Bi ja="海外の人と関わってみたいけど距離感がわからない方へ。自然に、対等に出会えます。" en="For you who'd like to connect with people from abroad but aren't sure how. Meet them naturally, as equals." />
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
