"use client";
import { useEffect, useState } from "react";
import { Bi } from "@/lib/i18n";

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
