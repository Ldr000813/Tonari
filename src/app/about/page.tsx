"use client";
import { Bi } from "@/lib/i18n";

export default function About() {
  return (
    <>
      <section className="section">
        <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
          <Bi ja="となりとは" en="About Tonari" />
        </h1>
        <p className="lead mt-3">
          <Bi
            ja="外国人と地域の人が、半々・対等に“となりあう”。双方が得をする多文化共生の場です。"
            en="A place where newcomers and locals become neighbors — half and half, as equals, where both sides gain."
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
