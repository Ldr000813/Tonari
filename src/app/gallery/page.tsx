"use client";
import { useEffect, useState } from "react";
import { Bi } from "@/lib/i18n";
import { LINKS } from "@/lib/links";

type Img = { url: string; pathname: string };

export default function Gallery() {
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j.images)) setImages(j.images); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <h1 className="text-3xl sm:text-4xl font-black text-ink text-center">
        <Bi ja="活動のようす" en="Gallery" />
      </h1>
      <p className="lead mt-3">
        <Bi ja="これまでの集まりの一枚一枚。空気感が、いちばん伝わると思います。" en="Moments from our gatherings. Sometimes a photo says it best." />
      </p>

      {LINKS.instagram && (
        <div className="text-center mt-6">
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-white shadow-md active:scale-95"
            style={{ background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <Bi ja="Instagramで最新の様子を見る" en="See more on Instagram" />
          </a>
        </div>
      )}

      {loading ? (
        <p className="text-center text-[#a29a8c] text-sm mt-10">読み込み中…</p>
      ) : images.length === 0 ? (
        <div className="card text-center mt-10">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-ink/80">
            <Bi ja="写真は準備中です。イベントを重ねて、少しずつ増やしていきます。" en="Photos are on the way — we'll add more as we go." />
          </p>
          <a href="/join" className="btn btn-ghost mt-4"><Bi ja="参加のしかたを見る" en="How to join" /></a>
        </div>
      ) : (
        <div className="mt-10 columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
          {images.map((im) => (
            <button
              key={im.url}
              onClick={() => setLightbox(im.url)}
              className="mb-3 block w-full overflow-hidden rounded-2xl border border-line focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="w-full object-cover hover:opacity-90 transition-opacity" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </section>
  );
}
