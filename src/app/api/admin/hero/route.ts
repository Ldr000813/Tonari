import { NextRequest, NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// GET: list current hero images (admin view). Also verifies the password — so it
// returns 200 (empty list) even if Blob isn't configured yet, as long as the
// password is correct. Only a wrong password returns 401.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { blobs } = await list({ prefix: "hero/" });
    const images = blobs
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map((b) => ({ url: b.url, pathname: b.pathname }));
    return NextResponse.json({ images, blob: true });
  } catch {
    // Blob store not configured yet — still authenticated.
    return NextResponse.json({ images: [], blob: false });
  }
}

// POST: upload a new hero image (multipart form field "file").
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 });
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`hero/${Date.now()}-${safe}`, file, { access: "public" });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload_failed" }, { status: 500 });
  }
}

// DELETE: remove a hero image by its blob URL (?url=...).
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete_failed" }, { status: 500 });
  }
}
