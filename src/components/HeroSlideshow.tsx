"use client";
import { useEffect, useState } from "react";

export type HeroImage = { url: string; pos: string };

// Cross-fading hero background of past event photos (fade out / fade in + slow
// zoom). Each image is cropped around its admin-chosen focal point (pos).
export default function HeroSlideshow({ images, interval = 5000 }: { images: HeroImage[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden="true">
      {images.map((img, idx) => (
        <div
          key={img.url}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            className="w-full h-full object-cover kenburns"
            style={{ objectPosition: img.pos }}
          />
        </div>
      ))}
    </div>
  );
}
