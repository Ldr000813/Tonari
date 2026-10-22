"use client";
import { useEffect, useRef, useState } from "react";
import { prepareImage } from "@/lib/imagePrep";
import { evStatus, fmtDate } from "@/lib/eventStatus";
import CalendarMonth, { dayNum } from "@/components/CalendarMonth";

const PW_KEY = "tonari_admin_pw";

type Img = { url: string; pathname: string; x?: number; y?: number };
type EvText = { title: string; place: string; desc: string; fee: string };
type Ev = {
  id: string; date: string; deadline: string;
  startDate: string; deadlineDate: string; paused: boolean;
  image: string; displayImage: string; dispX: number; dispY: number;
  ja: EvText; en: EvText;
};

type Tab = "hero" | "gallery" | "events" | "tools";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("hero");
  const [msg, setMsg] = useState("");

  async function tryAuth(p: string) {
    const r = await fetch("/api/admin/hero", { headers: { "x-admin-password": p }, cache: "no-store" });
    return r.ok;
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(PW_KEY) : null;
    if (saved) { setPw(saved); tryAuth(saved).then(setAuthed); }
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const ok = await tryAuth(pw);
    if (ok) { setAuthed(true); try { sessionStorage.setItem(PW_KEY, pw); } catch {} }
    else setMsg("パスワードが違います。");
  }
  function logout() { try { sessionStorage.removeItem(PW_KEY); } catch {} setAuthed(false); setPw(""); }

  if (!authed) {
    return (
      <section className="section max-w-sm">
        <h1 className="text-2xl font-black text-ink text-center">管理ログイン</h1>
        <p className="text-sm text-[#8a8378] text-center mt-1 mb-6">となり運営専用。</p>
        <form onSubmit={login} className="space-y-3">
          <input type="password" placeholder="パスワード" value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full border border-line rounded-xl p-3" />
          <button className="btn btn-primary w-full">ログイン</button>
        </form>
        {msg && <p className="text-rose-600 text-sm mt-3 text-center">{msg}</p>}
      </section>
    );
  }

  const tabBtn = (t: Tab, label: string) =>
    (<button onClick={() => setTab(t)}
      className={"px-4 py-2 rounded-full text-sm font-bold transition-colors " + (tab === t ? "bg-teal text-white" : "bg-white text-teal border border-teal/40 hover:bg-mint")}>
      {label}
    </button>);

  return (
    <section className="section">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-ink">管理画面</h1>
        <button onClick={logout} className="text-sm text-[#8a8378] underline">ログアウト</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabBtn("hero", "ホーム写真")}
        {tabBtn("gallery", "活動のようす")}
        {tabBtn("events", "イベント")}
        {tabBtn("tools", "ツール")}
      </div>

      {tab === "hero" && <HeroPanel pw={pw} />}
      {tab === "gallery" && <GalleryPanel pw={pw} />}
      {tab === "events" && <EventsPanel pw={pw} />}
      {tab === "tools" && <ToolsPanel pw={pw} />}
    </section>
  );
}

/* ---------------- Hero photos (with focal point) ---------------- */

function HeroPanel({ pw }: { pw: string }) {
  const [images, setImages] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const headers = { "x-admin-password": pw };

  async function load() {
    const r = await fetch("/api/admin/hero", { headers, cache: "no-store" });
    if (r.ok) setImages((await r.json()).images || []);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]; if (!raw) return;
    setBusy(true); setMsg("");
    const file = await prepareImage(raw);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/hero", { method: "POST", headers, body: fd });
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (r.ok) load(); else setMsg("アップロードに失敗しました：" + ((await r.json().catch(() => ({}))).error || r.status));
  }
  async function remove(im: Img) {
    if (!confirm("この写真を削除しますか？")) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/hero?url=${encodeURIComponent(im.url)}&pathname=${encodeURIComponent(im.pathname)}`, { method: "DELETE", headers });
    setBusy(false);
    if (r.ok) load(); else setMsg("削除に失敗しました。");
  }
  function setFocal(pathname: string, x: number, y: number) {
    setImages((arr) => arr.map((im) => (im.pathname === pathname ? { ...im, x, y } : im)));
  }
  async function saveFocal(im: Img) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/hero", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: im.pathname, x: im.x ?? 50, y: im.y ?? 50 }),
    });
    setBusy(false);
    setMsg(r.ok ? "位置を保存しました。" : "位置の保存に失敗しました。");
  }

  return (
    <div>
      <div className="card mb-6">
        <p className="font-bold text-ink mb-1">写真を追加</p>
        <p className="text-xs text-[#8a8378] mb-3">ホーム最上部のスライドショーに表示されます。横長の写真がおすすめです。</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={upload} disabled={busy} className="text-sm" />
        {busy && <p className="text-sm text-teal mt-2">処理中…</p>}
      </div>

      <p className="text-sm font-semibold text-ink/70 mb-1">現在の写真（{images.length}枚）</p>
      <p className="text-xs text-[#8a8378] mb-4">写真の上をクリック／ドラッグして、ホームで<b>中心に映したい場所</b>を指定できます。右側がホームでの見え方プレビューです。</p>

      {images.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだ写真がありません。上から追加してください。（未登録の間は、初期のサンプル写真が表示されます）</p>
      ) : (
        <div className="space-y-6">
          {images.map((im) => (
            <FocalCard key={im.url} im={im} busy={busy} onFocal={setFocal} onSave={saveFocal} onRemove={remove} />
          ))}
        </div>
      )}
      {msg && <p className="text-teal text-sm mt-4">{msg}</p>}
    </div>
  );
}

function FocalCard({
  im, busy, onFocal, onSave, onRemove,
}: {
  im: Img; busy: boolean;
  onFocal: (pathname: string, x: number, y: number) => void;
  onSave: (im: Img) => void;
  onRemove: (im: Img) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const x = im.x ?? 50, y = im.y ?? 50;

  function applyFromEvent(clientX: number, clientY: number) {
    const el = boxRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.min(100, Math.max(0, Math.round(((clientX - r.left) / r.width) * 100)));
    const ny = Math.min(100, Math.max(0, Math.round(((clientY - r.top) / r.height) * 100)));
    onFocal(im.pathname, nx, ny);
  }

  return (
    <div className="card">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div
            ref={boxRef}
            onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDragging(true); applyFromEvent(e.clientX, e.clientY); }}
            onPointerMove={(e) => { if (dragging) applyFromEvent(e.clientX, e.clientY); }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            className="relative w-full rounded-xl overflow-hidden border border-line cursor-crosshair select-none touch-none bg-[#f3efe6]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt="" draggable={false} className="w-full max-h-72 object-contain pointer-events-none" />
            <div className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)] bg-teal/70 pointer-events-none"
              style={{ left: `${x}%`, top: `${y}%` }} />
          </div>
          <p className="text-xs text-[#8a8378] mt-2">中心：{x}% / {y}%　（クリックまたはドラッグで調整）</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink/70 mb-1">ホームでの見え方</p>
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-line bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/55" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-sm sm:text-base drop-shadow text-center px-2">海の向こうも、となりだった。</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => onSave(im)} disabled={busy} className="btn btn-primary text-sm py-2">この位置を保存</button>
            <button onClick={() => onFocal(im.pathname, 50, 50)} disabled={busy} className="text-sm text-[#8a8378] underline">中央に戻す</button>
            <button onClick={() => onRemove(im)} disabled={busy} className="ml-auto text-sm text-rose-600 underline">削除</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Gallery photos ---------------- */

function GalleryPanel({ pw }: { pw: string }) {
  const [images, setImages] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const headers = { "x-admin-password": pw };

  async function load() {
    const r = await fetch("/api/admin/gallery", { headers, cache: "no-store" });
    if (r.ok) setImages((await r.json()).images || []);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files || !files.length) return;
    setBusy(true); setMsg("");
    for (const raw of Array.from(files)) {
      const file = await prepareImage(raw);
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/admin/gallery", { method: "POST", headers, body: fd });
      if (!r.ok) { setMsg("アップロードに失敗しました：" + ((await r.json().catch(() => ({}))).error || r.status)); break; }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }
  async function remove(url: string) {
    if (!confirm("この写真を削除しますか？")) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/gallery?url=${encodeURIComponent(url)}`, { method: "DELETE", headers });
    setBusy(false);
    if (r.ok) load(); else setMsg("削除に失敗しました。");
  }

  return (
    <div>
      <div className="card mb-6">
        <p className="font-bold text-ink mb-1">写真を追加</p>
        <p className="text-xs text-[#8a8378] mb-3">「活動のようす」ページに表示されます。複数まとめて選べます。参加者が写る写真は、本人の了承を得てから載せてください。</p>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={upload} disabled={busy} className="text-sm" />
        {busy && <p className="text-sm text-teal mt-2">処理中…</p>}
      </div>

      <p className="text-sm font-semibold text-ink/70 mb-3">現在の写真（{images.length}枚）</p>
      {images.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだ写真がありません。上から追加してください。</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((im) => (
            <div key={im.url} className="relative rounded-xl overflow-hidden border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="w-full h-32 object-cover" />
              <button onClick={() => remove(im.url)} disabled={busy}
                className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow">削除</button>
            </div>
          ))}
        </div>
      )}
      {msg && <p className="text-rose-600 text-sm mt-4">{msg}</p>}
    </div>
  );
}

/* ---------------- Events ---------------- */

const emptyEv = (): Ev => ({
  id: "", date: "", deadline: "", startDate: "", deadlineDate: "", paused: false,
  image: "", displayImage: "", dispX: 50, dispY: 50,
  ja: { title: "", place: "", desc: "", fee: "" },
  en: { title: "", place: "", desc: "", fee: "" },
});

function EventsPanel({ pw }: { pw: string }) {
  const [events, setEvents] = useState<Ev[]>([]);
  const [draft, setDraft] = useState<Ev>(emptyEv());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const headers = { "x-admin-password": pw, "Content-Type": "application/json" };

  async function load() {
    const r = await fetch("/api/admin/events", { headers: { "x-admin-password": pw }, cache: "no-store" });
    if (r.ok) setEvents((await r.json()).events || []);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function add() {
    if (!draft.ja.title.trim()) { setMsg("日本語のタイトルは必須です。"); return; }
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/events", { method: "POST", headers, body: JSON.stringify(draft) });
    setBusy(false);
    if (r.ok) { setDraft(emptyEv()); load(); setMsg("イベントを追加しました。"); }
    else setMsg("追加に失敗しました。");
  }
  async function save(ev: Ev) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/events", { method: "PATCH", headers, body: JSON.stringify(ev) });
    setBusy(false);
    setMsg(r.ok ? "保存しました。" : "保存に失敗しました。");
  }
  async function remove(id: string) {
    if (!confirm("このイベントを削除しますか？")) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-password": pw } });
    setBusy(false);
    if (r.ok) load(); else setMsg("削除に失敗しました。");
  }
  function patchLocal(id: string, patch: Partial<Ev> | { ja?: Partial<EvText>; en?: Partial<EvText> }) {
    setEvents((arr) => arr.map((e) => (e.id === id ? mergeEv(e, patch) : e)));
  }

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  async function runAI() {
    if (!draft.image) { setAiMsg("先にイベント画像をアップロードしてください。"); return; }
    setAiBusy(true); setAiMsg("AIが画像を読み取っています…");
    try {
      const r = await fetch("/api/admin/event-ai", { method: "POST", headers, body: JSON.stringify({ imageUrl: draft.image, prompt: aiPrompt }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setAiMsg("AI自動入力に失敗しました：" + (d.error || r.status) + (d.detail ? `（${d.detail}）` : ""));
        return;
      }
      setDraft((prev) => mergeEv(prev, {
        ...(d.startDate ? { startDate: d.startDate } : {}),
        ...(d.deadlineDate ? { deadlineDate: d.deadlineDate } : {}),
        ...(d.dateLabel != null ? { date: d.dateLabel } : {}),
        ...(d.deadlineLabel != null ? { deadline: d.deadlineLabel } : {}),
        ja: d.ja || {}, en: d.en || {},
      }));
      setAiMsg("✅ AIが入力しました。下の各項目を確認・修正して「追加する」を押してください。");
    } catch (e: any) {
      setAiMsg("通信に失敗しました：" + (e?.message || "unknown"));
    } finally { setAiBusy(false); }
  }

  return (
    <div>
      <div className="card mb-6">
        <p className="font-bold text-ink mb-3">イベントを追加</p>
        <EvFields ev={draft} pw={pw} onChange={(patch) => setDraft((d) => mergeEv(d, patch))}
          ai={{ prompt: aiPrompt, setPrompt: setAiPrompt, run: runAI, busy: aiBusy, msg: aiMsg }} />
        <button onClick={add} disabled={busy} className="btn btn-primary text-sm py-2 mt-3">追加する</button>
      </div>

      <p className="text-sm font-semibold text-ink/70 mb-3">登録済みイベント（{events.length}件）</p>
      {events.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだイベントがありません。上のフォームから追加してください。（未登録の間は、ページに「準備中」と表示されます）</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => {
            const st = evStatus(e);
            const badge = e.paused
              ? { t: "一時停止中", c: "bg-[#FDE8C8] text-[#9a6b12]" }
              : st.hidden
              ? { t: "期限切れ（自動非表示）", c: "bg-[#EFE7D6] text-[#8a8378]" }
              : st.closed
              ? { t: "締め切り済み", c: "bg-[#FADCDC] text-[#b4474a]" }
              : { t: "公開中", c: "bg-mint text-teal" };
            return (
              <div key={e.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className={"inline-flex items-center rounded-full text-xs font-bold px-2.5 py-1 " + badge.c}>{badge.t}</span>
                  <button onClick={() => { patchLocal(e.id, { paused: !e.paused }); save(mergeEv(e, { paused: !e.paused })); }}
                    disabled={busy} className="text-xs font-bold text-teal underline">
                    {e.paused ? "▶ 再開する" : "⏸ 一時停止する"}
                  </button>
                </div>
                <EvFields ev={e} pw={pw} onChange={(patch) => patchLocal(e.id, patch)} />
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => save(e)} disabled={busy} className="btn btn-primary text-sm py-2">保存</button>
                  <button onClick={() => remove(e.id)} disabled={busy} className="ml-auto text-sm text-rose-600 underline">削除</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {msg && <p className="text-teal text-sm mt-4">{msg}</p>}
    </div>
  );
}

function mergeEv(e: Ev, patch: any): Ev {
  return {
    ...e,
    ...("date" in patch ? { date: patch.date } : {}),
    ...("deadline" in patch ? { deadline: patch.deadline } : {}),
    ...("startDate" in patch ? { startDate: patch.startDate } : {}),
    ...("deadlineDate" in patch ? { deadlineDate: patch.deadlineDate } : {}),
    ...("paused" in patch ? { paused: patch.paused } : {}),
    ...("image" in patch ? { image: patch.image } : {}),
    ...("displayImage" in patch ? { displayImage: patch.displayImage } : {}),
    ...("dispX" in patch ? { dispX: patch.dispX } : {}),
    ...("dispY" in patch ? { dispY: patch.dispY } : {}),
    ja: patch.ja ? { ...e.ja, ...patch.ja } : e.ja,
    en: patch.en ? { ...e.en, ...patch.en } : e.en,
  };
}

// 表示画像のアップロード＋焦点（指で中心指定）ピッカー
function DisplayImagePicker({ ev, pw, onChange }: { ev: Ev; pw: string; onChange: (p: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const x = ev.dispX ?? 50, y = ev.dispY ?? 50;

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]; if (!raw) return;
    setUploading(true);
    try {
      const file = await prepareImage(raw);
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/admin/event-image", { method: "POST", headers: { "x-admin-password": pw }, body: fd });
      if (r.ok) onChange({ displayImage: (await r.json()).url, dispX: 50, dispY: 50 });
      else alert("画像のアップロードに失敗しました：" + ((await r.json().catch(() => ({}))).error || r.status));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function applyFrom(clientX: number, clientY: number) {
    const el = boxRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.min(100, Math.max(0, Math.round(((clientX - r.left) / r.width) * 100)));
    const ny = Math.min(100, Math.max(0, Math.round(((clientY - r.top) / r.height) * 100)));
    onChange({ dispX: nx, dispY: ny });
  }

  return (
    <div className="rounded-xl border border-line p-3">
      <label className="text-xs font-bold text-ink/70">表示画像（任意・公開カードに出る写真）</label>
      {!ev.displayImage ? (
        <div className="mt-1">
          <input ref={fileRef} type="file" accept="image/*" onChange={pick} disabled={uploading} className="text-xs" />
          {uploading && <p className="text-xs text-teal mt-1">アップロード中…</p>}
          <p className="text-[11px] text-[#8a8378] mt-1">未設定なら、上の「AIに渡す画像」が表示に使われます。</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <div>
            <p className="text-[11px] text-[#8a8378] mb-1">画像の上を<b>指でタッチ／ドラッグ</b>して、中心に映す場所を指定</p>
            <div
              ref={boxRef}
              onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDragging(true); applyFrom(e.clientX, e.clientY); }}
              onPointerMove={(e) => { if (dragging) applyFrom(e.clientX, e.clientY); }}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              className="relative w-full rounded-lg overflow-hidden border border-line cursor-crosshair select-none touch-none bg-[#f3efe6]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ev.displayImage} alt="" draggable={false} className="w-full max-h-52 object-contain pointer-events-none" />
              <div className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)] bg-teal/70 pointer-events-none"
                style={{ left: `${x}%`, top: `${y}%` }} />
            </div>
            <p className="text-[11px] text-[#8a8378] mt-1">中心：{x}% / {y}%</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-ink/70 mb-1">カードでの見え方</p>
            <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden border border-line bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ev.displayImage} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button type="button" onClick={() => onChange({ dispX: 50, dispY: 50 })} className="text-xs text-[#8a8378] underline">中央に戻す</button>
              <button type="button" onClick={() => onChange({ displayImage: "" })} className="ml-auto text-xs text-rose-600 underline">表示画像を削除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Tools: anonymous date poll ---------------- */

function ToolsPanel({ pw }: { pw: string }) {
  const inp = "w-full border border-line rounded-lg p-2 text-sm";
  const headers = { "x-admin-password": pw, "Content-Type": "application/json" };
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const [polls, setPolls] = useState<{ id: string; title: string; createdAt: number; dates: string[]; closed: boolean }[]>([]);

  async function loadPolls() {
    const r = await fetch("/api/poll", { headers: { "x-admin-password": pw }, cache: "no-store" });
    if (r.ok) setPolls((await r.json()).polls || []);
  }
  useEffect(() => { loadPolls(); }, []); // eslint-disable-line

  async function create() {
    const ds = dates.filter(Boolean).sort();
    if (!title.trim()) { setMsg("タイトルを入力してください。"); return; }
    if (!ds.length) { setMsg("候補日をカレンダーから選んでください。"); return; }
    setBusy(true); setMsg(""); setCreatedUrl("");
    const r = await fetch("/api/poll", { method: "POST", headers, body: JSON.stringify({ title, note, dates: ds }) });
    setBusy(false);
    if (r.ok) {
      const { id } = await r.json();
      setCreatedUrl(`${location.origin}/poll/${id}`);
      setTitle(""); setNote(""); setDates([]); loadPolls();
    } else setMsg("作成に失敗しました。");
  }
  async function removePoll(id: string) {
    if (!confirm("この日程調整を削除しますか？（回答も消えます）")) return;
    const r = await fetch(`/api/poll/${id}`, { method: "DELETE", headers: { "x-admin-password": pw } });
    if (r.ok) loadPolls();
  }
  async function toggleClosed(id: string, closed: boolean) {
    const r = await fetch(`/api/poll/${id}`, { method: "PATCH", headers, body: JSON.stringify({ closed }) });
    if (r.ok) loadPolls();
  }
  function copy(u: string) { try { navigator.clipboard?.writeText(u); setMsg("URLをコピーしました。"); } catch {} }

  return (
    <div>
      <div className="card mb-6">
        <p className="font-bold text-ink mb-1">かんたん日程調整（匿名）</p>
        <p className="text-xs text-[#8a8378] mb-3">候補日を並べて作成し、発行されたURLを共有。だれでも匿名で○△×で回答でき、集計が見られます（データベース不要・使い捨て）。</p>

        <label className="text-xs font-bold text-ink/70">タイトル</label>
        <input className={inp + " mb-3"} placeholder="例: 12月の交流会はいつがいい？" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="text-xs font-bold text-ink/70">ひとこと説明（任意）</label>
        <textarea className={inp + " mb-3"} rows={2} placeholder="例: ホームパーティを予定。都合のいい日に○をつけてね。" value={note} onChange={(e) => setNote(e.target.value)} />

        <label className="text-xs font-bold text-ink/70">候補日（カレンダーで選ぶ）</label>
        <p className="text-[11px] text-[#8a8378] mb-2">日付をタップで追加／もう一度タップで解除。月は ‹ › で移動できます。</p>
        <div className="max-w-xs">
          <CalendarMonth
            y={view.y} m={view.m}
            onPrev={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
            onNext={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
            cell={(iso) => {
              const on = dates.includes(iso);
              return (
                <button type="button" onClick={() => setDates((a) => (a.includes(iso) ? a.filter((x) => x !== iso) : [...a, iso].sort()))}
                  className={"w-full h-full rounded-lg text-sm transition-colors " + (on ? "bg-teal text-white font-bold" : "text-ink hover:bg-mint")}>
                  {dayNum(iso)}
                </button>
              );
            }}
          />
        </div>
        {dates.filter(Boolean).length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-ink/70 mb-1">選択中（{dates.filter(Boolean).length}）</p>
            <div className="flex flex-wrap gap-1.5">
              {dates.filter(Boolean).sort().map((iso) => (
                <span key={iso} className="inline-flex items-center gap-1 rounded-full bg-mint text-teal text-xs font-bold pl-2.5 pr-1 py-1">
                  {fmtDate(iso, "ja")}
                  <button type="button" onClick={() => setDates((a) => a.filter((x) => x !== iso))} className="w-4 h-4 rounded-full bg-white/70 text-teal leading-none">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button onClick={create} disabled={busy} className="btn btn-primary text-sm py-2">作成してURLを発行</button>
        </div>

        {createdUrl && (
          <div className="mt-4 rounded-xl bg-mint/60 border border-mintline p-3">
            <p className="text-xs font-bold text-teal mb-1">共有用URL（これを送ってください）</p>
            <div className="flex items-center gap-2">
              <input readOnly value={createdUrl} className={inp + " bg-white"} onFocus={(e) => e.currentTarget.select()} />
              <button onClick={() => copy(createdUrl)} className="btn btn-ghost text-xs py-2 shrink-0">コピー</button>
              <a href={createdUrl} target="_blank" rel="noreferrer" className="btn btn-primary text-xs py-2 shrink-0">開く</a>
            </div>
          </div>
        )}
        {msg && <p className="text-teal text-sm mt-3">{msg}</p>}
      </div>

      <p className="text-sm font-semibold text-ink/70 mb-3">作成済みの日程調整（{polls.length}）</p>
      {polls.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだありません。上から作成してください。</p>
      ) : (
        <div className="space-y-2">
          {polls.map((p) => {
            const url = `${typeof window !== "undefined" ? location.origin : ""}/poll/${p.id}`;
            return (
              <div key={p.id} className="card py-3">
                <div className="flex items-center gap-3">
                  <span className={"inline-flex items-center rounded-full text-[11px] font-bold px-2 py-0.5 shrink-0 " + (p.closed ? "bg-[#FADCDC] text-[#b4474a]" : "bg-mint text-teal")}>
                    {p.closed ? "中止中" : "受付中"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink truncate">{p.title}</p>
                    <p className="text-xs text-[#8a8378]">{p.dates.length}候補 ・ {new Date(p.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <button onClick={() => copy(url)} className="text-xs font-bold text-teal">URLコピー</button>
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal underline">開く</a>
                  <button onClick={() => toggleClosed(p.id, !p.closed)} className="text-xs font-bold text-[#9a6b12]">
                    {p.closed ? "▶ 再開する" : "■ 受付を中止"}
                  </button>
                  <button onClick={() => removePoll(p.id)} className="ml-auto text-xs text-rose-600 underline">削除</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type AiProps = { prompt: string; setPrompt: (s: string) => void; run: () => void; busy: boolean; msg?: string };
function EvFields({ ev, pw, onChange, ai }: { ev: Ev; pw: string; onChange: (patch: any) => void; ai?: AiProps }) {
  const inp = "w-full border border-line rounded-lg p-2 text-sm";
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]; if (!raw) return;
    setUploading(true);
    try {
      const file = await prepareImage(raw);
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/admin/event-image", { method: "POST", headers: { "x-admin-password": pw }, body: fd });
      if (r.ok) onChange({ image: (await r.json()).url });
      else alert("画像のアップロードに失敗しました：" + ((await r.json().catch(() => ({}))).error || r.status));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {/* pause toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={!!ev.paused} onChange={(e) => onChange({ paused: e.target.checked })} className="w-4 h-4 accent-teal" />
        <span className="text-sm font-bold text-ink">一時停止（チェックすると公開ページに表示されません）</span>
      </label>

      {/* AI source image */}
      <div>
        <label className="text-xs font-bold text-ink/70">AIに渡す画像（任意・読み取り用）</label>
        <p className="text-[11px] text-[#8a8378] mb-1">チラシなど。下の「AIで自動入力」の読み取りに使います。表示画像が未設定のときは、この画像が公開カードにも表示されます。</p>
        <div className="flex items-center gap-3">
          {ev.image ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ev.image} alt="" className="w-28 h-20 object-cover rounded-lg border border-line" />
              <button type="button" onClick={() => onChange({ image: "" })}
                className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow">削除</button>
            </div>
          ) : (
            <div className="w-28 h-20 rounded-lg border border-dashed border-line grid place-items-center text-[#b4ab9b] text-xs">なし</div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} disabled={uploading} className="text-xs" />
            {uploading && <p className="text-xs text-teal mt-1">アップロード中…</p>}
          </div>
        </div>
      </div>

      {/* display image + focal picker */}
      <DisplayImagePicker ev={ev} pw={pw} onChange={onChange} />

      {/* AI auto-fill (add form only) */}
      {ai && (
        <div className="rounded-xl border border-teal/40 bg-mint/40 p-3 space-y-2">
          <label className="text-xs font-extrabold text-teal">✨ AIで自動入力（画像＋指示から、下の項目をまとめて生成）</label>
          <textarea className={inp} rows={2}
            placeholder="例：より多くの人が参加したくなるように、親しみやすく。留学生にも伝わるように。"
            value={ai.prompt} onChange={(e) => ai.setPrompt(e.target.value)} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={ai.run} disabled={ai.busy || !ev.image}
              className="btn btn-primary text-sm py-2 disabled:opacity-50">
              {ai.busy ? "AIが作成中…" : "画像＋指示からAIで自動入力"}
            </button>
            {!ev.image && <span className="text-[11px] text-[#8a8378]">先に画像をアップロードしてください</span>}
          </div>
          {ai.msg && <p className="text-xs font-semibold text-teal">{ai.msg}</p>}
          <p className="text-[11px] text-[#8a8378]">※ 生成後は内容を必ず確認・修正してください。日時や場所は画像から読み取ります。</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-ink/70">開催日</label>
          <input type="date" className={inp} value={ev.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold text-ink/70">応募締め切り</label>
          <input type="date" className={inp} value={ev.deadlineDate} onChange={(e) => onChange({ deadlineDate: e.target.value })} />
        </div>
      </div>
      <p className="text-[11px] text-[#8a8378] -mt-1">
        ※ 日付を入れると、締切・開催日を過ぎたら「締め切りました」と表示し、<b>1週間後に自動で非表示</b>になります。日付を空にすると自動では消えません。
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-ink/70">日時ラベル（任意・上書き）</label>
          <input className={inp} placeholder="例: 10/17 (金) 13:00〜" value={ev.date} onChange={(e) => onChange({ date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold text-ink/70">締切ラベル（任意・上書き）</label>
          <input className={inp} placeholder="例: 10/15 (水) 23:59" value={ev.deadline} onChange={(e) => onChange({ deadline: e.target.value })} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#FFF9E9] p-3 space-y-2">
          <p className="text-xs font-extrabold text-ink/70">日本語</p>
          <input className={inp} placeholder="タイトル（必須）" value={ev.ja.title} onChange={(e) => onChange({ ja: { title: e.target.value } })} />
          <input className={inp} placeholder="場所（例: TOMOの家）" value={ev.ja.place} onChange={(e) => onChange({ ja: { place: e.target.value } })} />
          <input className={inp} placeholder="参加費（例: 無料 / 1人1,000円）" value={ev.ja.fee} onChange={(e) => onChange({ ja: { fee: e.target.value } })} />
          <textarea className={inp} rows={2} placeholder="ひとこと説明" value={ev.ja.desc} onChange={(e) => onChange({ ja: { desc: e.target.value } })} />
        </div>
        <div className="rounded-xl bg-mint/60 p-3 space-y-2">
          <p className="text-xs font-extrabold text-ink/70">English（空欄なら日本語を表示）</p>
          <input className={inp} placeholder="Title" value={ev.en.title} onChange={(e) => onChange({ en: { title: e.target.value } })} />
          <input className={inp} placeholder="Place" value={ev.en.place} onChange={(e) => onChange({ en: { place: e.target.value } })} />
          <input className={inp} placeholder="Fee (e.g. Free / ¥1,000)" value={ev.en.fee} onChange={(e) => onChange({ en: { fee: e.target.value } })} />
          <textarea className={inp} rows={2} placeholder="Short description" value={ev.en.desc} onChange={(e) => onChange({ en: { desc: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}
