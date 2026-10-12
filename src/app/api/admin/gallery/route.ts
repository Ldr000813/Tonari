import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";
import { listByPrefix } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

// GET: list gallery images (admin view). Also verifies the password.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const blobs = await listByPrefix("gallery/");
    const images = blobs.map((b) => ({ url: b.url, pathname: b.pathname }));
    return NextResponse.json({ images, blob: true });
  } catch {
    return NextResponse.json({ images: [], blob: false });
  }
}

// POST: upload a gallery photo (multipart form field "file").
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 });
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`gallery/${Date.now()}-${safe}`, file, { access: "public" });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload_failed" }, { status: 500 });
  }
}

// DELETE: remove a gallery photo by its blob URL (?url=...).
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
