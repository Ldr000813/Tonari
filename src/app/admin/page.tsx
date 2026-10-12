"use client";
import { useEffect, useRef, useState } from "react";

const PW_KEY = "tonari_admin_pw";

type Img = { url: string; pathname: string; x?: number; y?: number };
type EvText = { title: string; place: string; desc: string };
type Ev = { id: string; date: string; ja: EvText; en: EvText };

type Tab = "hero" | "gallery" | "events";

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
      </div>

      {tab === "hero" && <HeroPanel pw={pw} />}
      {tab === "gallery" && <GalleryPanel pw={pw} />}
      {tab === "events" && <EventsPanel pw={pw} />}
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
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setMsg("");
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
    for (const file of Array.from(files)) {
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

const emptyEv = (): Ev => ({ id: "", date: "", ja: { title: "", place: "", desc: "" }, en: { title: "", place: "", desc: "" } });

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

  return (
    <div>
      <div className="card mb-6">
        <p className="font-bold text-ink mb-3">イベントを追加</p>
        <EvFields ev={draft} onChange={(patch) => setDraft((d) => mergeEv(d, patch))} />
        <button onClick={add} disabled={busy} className="btn btn-primary text-sm py-2 mt-3">追加する</button>
      </div>

      <p className="text-sm font-semibold text-ink/70 mb-3">登録済みイベント（{events.length}件）</p>
      {events.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだイベントがありません。上のフォームから追加してください。（未登録の間は、ページに「準備中」と表示されます）</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.id} className="card">
              <EvFields ev={e} onChange={(patch) => patchLocal(e.id, patch)} />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => save(e)} disabled={busy} className="btn btn-primary text-sm py-2">保存</button>
                <button onClick={() => remove(e.id)} disabled={busy} className="ml-auto text-sm text-rose-600 underline">削除</button>
              </div>
            </div>
          ))}
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
    ja: patch.ja ? { ...e.ja, ...patch.ja } : e.ja,
    en: patch.en ? { ...e.en, ...patch.en } : e.en,
  };
}

function EvFields({ ev, onChange }: { ev: Ev; onChange: (patch: any) => void }) {
  const inp = "w-full border border-line rounded-lg p-2 text-sm";
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-ink/70">日時（表示用の文字列）</label>
        <input className={inp} placeholder="例: 10/17 (金) 13:00" value={ev.date} onChange={(e) => onChange({ date: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#FFF9E9] p-3 space-y-2">
          <p className="text-xs font-extrabold text-ink/70">日本語</p>
          <input className={inp} placeholder="タイトル（必須）" value={ev.ja.title} onChange={(e) => onChange({ ja: { title: e.target.value } })} />
          <input className={inp} placeholder="場所（例: TOMOの家）" value={ev.ja.place} onChange={(e) => onChange({ ja: { place: e.target.value } })} />
          <textarea className={inp} rows={2} placeholder="ひとこと説明" value={ev.ja.desc} onChange={(e) => onChange({ ja: { desc: e.target.value } })} />
        </div>
        <div className="rounded-xl bg-mint/60 p-3 space-y-2">
          <p className="text-xs font-extrabold text-ink/70">English（空欄なら日本語を表示）</p>
          <input className={inp} placeholder="Title" value={ev.en.title} onChange={(e) => onChange({ en: { title: e.target.value } })} />
          <input className={inp} placeholder="Place" value={ev.en.place} onChange={(e) => onChange({ en: { place: e.target.value } })} />
          <textarea className={inp} rows={2} placeholder="Short description" value={ev.en.desc} onChange={(e) => onChange({ en: { desc: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}
