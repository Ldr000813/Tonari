"use client";
import { useEffect, useRef, useState } from "react";

const PW_KEY = "tonari_admin_pw";

type Img = { url: string; pathname: string; x: number; y: number };

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [images, setImages] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = (p = pw) => ({ "x-admin-password": p });

  async function load(p = pw) {
    const r = await fetch("/api/admin/hero", { headers: headers(p), cache: "no-store" });
    if (r.ok) { setImages((await r.json()).images || []); return true; }
    return false;
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(PW_KEY) : null;
    if (saved) { setPw(saved); load(saved).then((ok) => setAuthed(ok)); }
  }, []); // eslint-disable-line

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const ok = await load(pw);
    if (ok) { setAuthed(true); try { sessionStorage.setItem(PW_KEY, pw); } catch {} }
    else setMsg("パスワードが違います。");
  }
  function logout() { try { sessionStorage.removeItem(PW_KEY); } catch {} setAuthed(false); setPw(""); setImages([]); }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg("");
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/hero", { method: "POST", headers: headers(), body: fd });
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (r.ok) load(); else setMsg("アップロードに失敗しました：" + ((await r.json().catch(() => ({}))).error || r.status));
  }

  async function remove(im: Img) {
    if (!confirm("この写真を削除しますか？")) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/hero?url=${encodeURIComponent(im.url)}&pathname=${encodeURIComponent(im.pathname)}`, { method: "DELETE", headers: headers() });
    setBusy(false);
    if (r.ok) load(); else setMsg("削除に失敗しました。");
  }

  // Update one image's focal point locally (live preview).
  function setFocal(pathname: string, x: number, y: number) {
    setImages((arr) => arr.map((im) => (im.pathname === pathname ? { ...im, x, y } : im)));
  }

  async function saveFocal(im: Img) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/hero", {
      method: "PATCH",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: im.pathname, x: im.x, y: im.y }),
    });
    setBusy(false);
    if (!r.ok) setMsg("位置の保存に失敗しました。");
    else setMsg("位置を保存しました。");
  }

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

  return (
    <section className="section">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-ink">ホーム写真の管理</h1>
        <button onClick={logout} className="text-sm text-[#8a8378] underline">ログアウト</button>
      </div>

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
    </section>
  );
}

function FocalCard({
  im, busy, onFocal, onSave, onRemove,
}: {
  im: Img;
  busy: boolean;
  onFocal: (pathname: string, x: number, y: number) => void;
  onSave: (im: Img) => void;
  onRemove: (im: Img) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function applyFromEvent(clientX: number, clientY: number) {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, Math.round(((clientX - r.left) / r.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((clientY - r.top) / r.height) * 100)));
    onFocal(im.pathname, x, y);
  }

  return (
    <div className="card">
      <div className="grid md:grid-cols-2 gap-4">
        {/* editable image with focal marker */}
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
            {/* focal marker */}
            <div
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)] bg-teal/70 pointer-events-none"
              style={{ left: `${im.x}%`, top: `${im.y}%` }}
            />
          </div>
          <p className="text-xs text-[#8a8378] mt-2">中心：{im.x}% / {im.y}%　（クリックまたはドラッグで調整）</p>
        </div>

        {/* live hero-crop preview */}
        <div>
          <p className="text-xs font-semibold text-ink/70 mb-1">ホームでの見え方</p>
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-line bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${im.x}% ${im.y}%` }} />
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
