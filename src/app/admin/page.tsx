"use client";
import { useEffect, useRef, useState } from "react";

const PW_KEY = "tonari_admin_pw";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [images, setImages] = useState<{ url: string; pathname: string }[]>([]);
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

  async function remove(url: string) {
    if (!confirm("この写真を削除しますか？")) return;
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/hero?url=${encodeURIComponent(url)}`, { method: "DELETE", headers: headers() });
    setBusy(false);
    if (r.ok) load(); else setMsg("削除に失敗しました。");
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

      <p className="text-sm font-semibold text-ink/70 mb-3">現在の写真（{images.length}枚）</p>
      {images.length === 0 ? (
        <p className="text-[#a29a8c] text-sm">まだ写真がありません。上から追加してください。（未登録の間は、初期のサンプル写真が表示されます）</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((im) => (
            <div key={im.url} className="relative rounded-xl overflow-hidden border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="w-full h-32 object-cover" />
              <button onClick={() => remove(im.url)} disabled={busy}
                className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow">
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      {msg && <p className="text-rose-600 text-sm mt-4">{msg}</p>}
    </section>
  );
}
