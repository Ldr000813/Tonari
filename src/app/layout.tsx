import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "となり（Tonari）｜地域に根ざす多文化共生コミュニティ",
  description:
    "在日外国人・留学生と地域の人が、半々・対等に出会う多文化共生コミュニティ「となり」。京田辺市から、全国へ。",
  openGraph: {
    title: "となり（Tonari）",
    description: "海の向こうも、となりだった。地域に根ざす多文化共生コミュニティ。",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <LangProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
