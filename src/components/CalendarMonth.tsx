"use client";
import React from "react";

const WD = ["日", "月", "火", "水", "木", "金", "土"];
export function pad(n: number) { return String(n).padStart(2, "0"); }
export function dayNum(iso: string) { return Number(iso.slice(8, 10)); }
export function isISO(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

// 1か月分のグリッド。各日の中身は cell(iso) が返す。ナビ任意。
export default function CalendarMonth({
  y, m, cell, onPrev, onNext, nav = true,
}: {
  y: number; m: number; // m は 0 始まり
  cell: (iso: string) => React.ReactNode;
  onPrev?: () => void; onNext?: () => void; nav?: boolean;
}) {
  const startDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        {nav ? <button type="button" onClick={onPrev} className="px-3 py-1 text-lg text-ink/60 hover:text-teal">‹</button> : <span />}
        <span className="font-bold text-ink">{y}年 {m + 1}月</span>
        {nav ? <button type="button" onClick={onNext} className="px-3 py-1 text-lg text-ink/60 hover:text-teal">›</button> : <span />}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold mb-1">
        {WD.map((w, i) => <div key={i} className={i === 0 ? "text-rose-400" : i === 6 ? "text-sky-500" : "text-[#8a8378]"}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => <div key={i} className="aspect-square">{iso ? cell(iso) : null}</div>)}
      </div>
    </div>
  );
}
