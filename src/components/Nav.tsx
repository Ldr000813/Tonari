"use client";
import { useState } from "react";
import Link from "next/link";
import { Bi, useLang } from "@/lib/i18n";

const links = [
  { href: "/", ja: "ホーム", en: "Home" },
  { href: "/about", ja: "となりとは", en: "About" },
  { href: "/events", ja: "イベント", en: "Events" },
  { href: "/join", ja: "参加する", en: "Join" },
];

export default function Nav() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-line">
      <nav className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="relative inline-block w-7 h-5">
            <span className="absolute left-0 top-0 w-5 h-5 rounded-full bg-yellow" />
            <span className="absolute left-2 top-0 w-5 h-5 rounded-full bg-teal/80" />
          </span>
          <span className="font-black text-lg tracking-wide text-ink">となり</span>
          <span className="text-[10px] tracking-[0.25em] text-[#a29a8c] font-bold">TONARI</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-ink/80 hover:text-teal">
              <Bi ja={l.ja} en={l.en} />
            </Link>
          ))}
          <button onClick={() => setLang(lang === "ja" ? "en" : "ja")} className="text-xs rounded-full border border-[#e4dcc8] px-3 py-1 font-bold">
            {lang === "ja" ? "English" : "日本語"}
          </button>
        </div>

        <button className="sm:hidden text-2xl" aria-label="menu" onClick={() => setOpen((v) => !v)}>
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="sm:hidden border-t border-line bg-cream px-5 py-3 space-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-1.5 font-bold text-ink/80">
              <Bi ja={l.ja} en={l.en} />
            </Link>
          ))}
          <button onClick={() => { setLang(lang === "ja" ? "en" : "ja"); }} className="mt-1 text-xs rounded-full border border-[#e4dcc8] px-3 py-1 font-bold">
            {lang === "ja" ? "English" : "日本語"}
          </button>
        </div>
      )}
    </header>
  );
}
