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
- `src/app/events/page.tsx` … イベント（内容は `/admin` の「イベント」タブで管理）
- `src/app/gallery/page.tsx` … 活動のようす（写真は `/admin` の「活動のようす」タブで管理）
- `src/app/join/page.tsx` … 参加する（手順・各種リンク）
- `src/components/Nav.tsx` / `Footer.tsx` … 共通ヘッダー・フッター
- `src/lib/i18n.tsx` … 日英切替（`<Bi ja="…" en="…" />` で文章を書く）

## よく編集する場所

- **リンク設定**：`src/app/join/page.tsx` 上部の `LINKS`（LINE・Instagram・問い合わせ）。
- **文章**：各ページの `<Bi ja="日本語" en="English" />`。
- **イベント・ギャラリー・ホーム写真**：コードではなく `/admin`（管理画面）から追加・編集。

## 管理画面（/admin）

- URL：`/admin`（例：https://あなたのサイト/admin）
- ログイン：環境変数 **`ADMIN_PASSWORD`** のパスワードを入力。
- タブは3つ：
  - **ホーム写真**：最上部スライドショーの写真を追加・削除。写真ごとに「中心に映したい場所（焦点）」をクリック／ドラッグで指定でき、ホームでの見え方プレビュー付き。
  - **活動のようす**：ギャラリーページ（`/gallery`）の写真を追加・削除（複数まとめて選択可）。
  - **イベント**：イベントページ（`/events`）の内容を追加・編集・削除。画像・開催日・応募締め切り・参加費・場所・説明を日英で入力（英語が空なら日本語を表示）。
    - **一時停止**：チェック（または「⏸ 一時停止」）で公開ページから隠す／再開も可能。
    - **自動処理**：開催日・締め切りを過ぎると「締め切りました」と表示し、**1週間後に自動で非表示**。日付を空にすると自動では消えません。
- データは Vercel Blob に保存され、各ページに自動反映されます（未登録の間は、ホームは `public/events/` の初期写真、イベント・ギャラリーは「準備中」を表示）。

### 必要な環境変数（Vercel → Settings → Environment Variables）

| 変数 | 用途 |
|---|---|
| `ADMIN_PASSWORD` | 管理ログインのパスワード（自由に設定） |
| `BLOB_READ_WRITE_TOKEN` | 画像保存用。Vercel で Blob ストアを作成し、このプロジェクトに接続すると**自動で追加**されます |
| `GEMINI_API_KEY` | イベント追加の「✨AIで自動入力」用。[Google AI Studio](https://aistudio.google.com/apikey) で無料のAPIキーを取得して設定 |
| `GEMINI_MODEL`（任意） | 使うモデル名。未設定なら `gemini-2.0-flash` |

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
