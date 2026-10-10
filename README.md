# となり（Tonari）ホームページ

地域に根ざす多文化共生コミュニティ「となり」の公式サイト。Next.js（App Router）＋ TypeScript ＋ Tailwind CSS。日英2言語対応。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
```

## 構成

- `src/app/page.tsx` … ホーム（ヒーロー・できること・こんな人へ）
- `src/app/about/page.tsx` … となりとは（課題・相互メリット・機能・ビジョン）
- `src/app/events/page.tsx` … イベント（`EVENTS` 配列に手で追加）
- `src/app/join/page.tsx` … 参加する（手順・各種リンク）
- `src/components/Nav.tsx` / `Footer.tsx` … 共通ヘッダー・フッター
- `src/lib/i18n.tsx` … 日英切替（`<Bi ja="…" en="…" />` で文章を書く）

## よく編集する場所

- **リンク設定**：`src/app/join/page.tsx` 上部の `LINKS`（LINE・Instagram・問い合わせ）。
- **文章**：各ページの `<Bi ja="日本語" en="English" />`。
- **イベント**：`src/app/events/page.tsx` の `EVENTS` 配列に追加（新しいものを上に）。

## 管理画面（ホーム写真の管理）

- URL：`/admin`（例：https://あなたのサイト/admin）
- ログイン：環境変数 **`ADMIN_PASSWORD`** のパスワードを入力。
- できること：ホーム最上部スライドショーの**写真を追加・削除**。写真は Vercel Blob に保存され、ホームに自動反映されます（未登録の間は `public/events/` の初期写真を表示）。

### 必要な環境変数（Vercel → Settings → Environment Variables）

| 変数 | 用途 |
|---|---|
| `ADMIN_PASSWORD` | 管理ログインのパスワード（自由に設定） |
| `BLOB_READ_WRITE_TOKEN` | 画像保存用。Vercel で Blob ストアを作成し、このプロジェクトに接続すると**自動で追加**されます |

### Vercel Blob ストアの作り方

Vercel のプロジェクト → **Storage** → **Create Database** → **Blob** を選び、このプロジェクトに Connect。これで `BLOB_READ_WRITE_TOKEN` が自動設定され、管理画面からの画像アップロードが有効になります。

ローカル開発でアップロードまで試したい場合は、`.env.local` に `ADMIN_PASSWORD=...` と `BLOB_READ_WRITE_TOKEN=...`（Vercel の Blob ストア設定からコピー）を入れてください。

## デプロイ（Vercel）

このフォルダは Vercel に接続済みです。`git push` すると自動でビルド・公開されます。
Next.js は自動検出されるので設定は不要です。

```bash
git add -A
git commit -m "feat: rebuild homepage with Next.js"
git push
```

## メモ

- 旧 `index.html`（静的版）は使われません。Next.js がルーティングを担います。不要なら削除してOKです。
