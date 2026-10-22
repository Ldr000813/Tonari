import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST: { imageUrl, prompt } -> uses Gemini to read the flyer image and fill the
// event form fields (JP/EN) in a way that attracts participants.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY が未設定です" }, { status: 500 });
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  try {
    const { imageUrl, prompt } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "no_image" }, { status: 400 });

    // fetch the uploaded flyer image and base64-encode it
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return NextResponse.json({ error: "image_fetch_failed" }, { status: 400 });
    const mime = imgRes.headers.get("content-type") || "image/jpeg";
    const b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");

    const today = new Date().toISOString().slice(0, 10);
    const instruction = buildPrompt(today, String(prompt || "").slice(0, 1000));

    const body = {
      contents: [
        { role: "user", parts: [{ text: instruction }, { inline_data: { mime_type: mime, data: b64 } }] },
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ error: "gemini_error", detail: t.slice(0, 300) }, { status: 502 });
    }
    const data = await r.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";
    const parsed = safeJson(text);
    if (!parsed) return NextResponse.json({ error: "parse_failed", raw: text.slice(0, 300) }, { status: 502 });

    // normalize shape
    const ja = parsed.ja || {};
    const en = parsed.en || {};
    return NextResponse.json({
      startDate: str(parsed.startDate, 10),
      deadlineDate: str(parsed.deadlineDate, 10),
      dateLabel: str(parsed.dateLabel, 60),
      deadlineLabel: str(parsed.deadlineLabel, 60),
      ja: { title: str(ja.title, 120), place: str(ja.place, 120), fee: str(ja.fee, 80), desc: str(ja.desc, 600) },
      en: { title: str(en.title, 120), place: str(en.place, 120), fee: str(en.fee, 80), desc: str(en.desc, 600) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "ai_failed" }, { status: 500 });
  }
}

function str(v: any, max: number) {
  return (typeof v === "string" ? v : "").slice(0, max);
}
function safeJson(t: string): any | null {
  try { return JSON.parse(t); } catch {}
  const m = t.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function buildPrompt(today: string, userPrompt: string) {
  return `あなたは、京都・京田辺の多文化交流コミュニティ「となり（Tonari）」のイベント告知を作るアシスタントです。
与えられたチラシ画像（と、主催者からの任意の指示）を読み取り、イベント掲載フォームの各項目を日本語と英語で生成してください。

目的：留学生と地域の人の両方が「参加したい」と感じる、わかりやすく親しみやすい文章にすること。やさしい日本語＋自然な英語。

今日の日付: ${today}（年がチラシに無い場合は、これを基準に“直近の未来の日付”として解釈する）
主催者からの追加指示: ${userPrompt || "（特になし）"}

次のJSONだけを出力してください（前後に説明やコードブロック記号を付けない）:
{
 "startDate": "YYYY-MM-DD 開催日。分かれば。不明なら空文字",
 "deadlineDate": "YYYY-MM-DD 応募締切。不明なら空文字",
 "dateLabel": "日時の表示用テキスト（例: 10/24（土）13:00〜15:30。チラシの表記に合わせる）",
 "deadlineLabel": "締切の表示用テキスト（例: 10/23（水）。無ければ空文字）",
 "ja": { "title": "短く魅力的な日本語タイトル", "place": "場所・集合場所", "fee": "参加費（例: 無料 / 1人1,000円）", "desc": "1〜2文の親しみやすい紹介文" },
 "en": { "title": "Short, inviting English title", "place": "Place / meeting point", "fee": "Fee (e.g. Free / ¥1,000)", "desc": "1–2 friendly sentences in natural English" }
}

ルール:
- チラシから読み取れない事実（日時・場所・費用）は推測で作らず空文字にする。
- ただしタイトルと紹介文（desc）は、人が集まるよう魅力的に表現してよい。
- 主催者の追加指示があれば、タイトルと紹介文のトーンに反映する。
- desc は長くしすぎない。フォーム用なので絵文字は入れない。
- 英語は直訳でなく自然な表現にする。`;
}
