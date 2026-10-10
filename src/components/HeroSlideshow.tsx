"use client";
import { useEffect, useState } from "react";

// Cross-fading hero background of past event photos (fade out / fade in + slow zoom).
export default function HeroSlideshow({ images, interval = 5000 }: { images: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden="true">
      {images.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover kenburns" />
        </div>
      ))}
    </div>
  );
}
