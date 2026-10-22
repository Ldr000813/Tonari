"use client";
import { useEffect, useRef } from "react";

// 過去イベントの写真を、スクロール位置に連動して「カードをめくる」ように回転させる。
// JSが動かない環境では、ふつうの写真リストとして表示される（段階的強化）。
export default function FlipGallery({ images, small = false }: { images: string[]; small?: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // モーション控えめ設定なら回転しない

    const update = () => {
      const vh = window.innerHeight;
      refs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        // p=1: まだ下にある（めくれて伏せた状態） / p=0: 定位置に起き上がった状態
        const p = Math.min(1, Math.max(0, (center - vh * 0.32) / (vh * 0.62)));
        const rot = (p * p * 88).toFixed(2);   // 下にあるほど大きく傾く（手前に伏せる）
        const ty = (p * 44).toFixed(1);
        const op = (1 - p * 0.65).toFixed(3);
        el.style.transform = `rotateX(${rot}deg) translateY(${ty}px)`;
        el.style.opacity = op;
      });
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [images.length]);

  return (
    <div className={small ? "space-y-4" : "space-y-6"} style={{ perspective: "1100px" }}>
      {images.map((src, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={"rounded-2xl overflow-hidden border border-line bg-white " + (small ? "shadow-lg" : "shadow-xl")}
          style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className={"w-full object-cover " + (small ? "h-40" : "h-56 sm:h-64")} loading="lazy" />
        </div>
      ))}
    </div>
  );
}
