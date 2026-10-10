"use client";
import Link from "next/link";
import { Bi } from "@/lib/i18n";

const APP_URL = "https://stamp-app-two.vercel.app";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-line bg-cream">
      <div className="max-w-5xl mx-auto px-5 py-12 text-center">
        <div className="font-black text-2xl tracking-wide text-ink">となり <span className="text-sm tracking-[0.25em] text-[#a29a8c]">TONARI</span></div>
        <p className="text-sm text-[#8a8378] mt-2">
          <Bi ja="地域に根ざす多文化共生コミュニティ。京田辺市から。" en="A multicultural community rooted in Kyotanabe." />
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm font-bold text-ink/80">
          <Link href="/about" className="hover:text-teal"><Bi ja="となりとは" en="About" /></Link>
          <Link href="/events" className="hover:text-teal"><Bi ja="イベント" en="Events" /></Link>
          <Link href="/join" className="hover:text-teal"><Bi ja="参加する" en="Join" /></Link>
          <a href={APP_URL} target="_blank" rel="noreferrer" className="hover:text-teal">
            <Bi ja="スタンプラリー" en="Stamp Rally" />
          </a>
        </div>

        <p className="text-xs text-[#b4ab9b] mt-8">© {new Date().getFullYear()} Tonari</p>
      </div>
    </footer>
  );
}
