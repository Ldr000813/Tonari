import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";
import { readPositions, writePositions, listHero, clampPos } from "@/lib/heroStore";

export const dynamic = "force-dynamic";

// GET: list current hero images (admin view) with their focal points. Also
// verifies the password — so it returns 200 (empty list) even if Blob isn't
// configured yet, as long as the password is correct. Only a wrong password
// returns 401.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const blobs = await listHero();
    const pos = await readPositions();
    const images = blobs.map((b) => {
      const p = pos[b.pathname] || { x: 50, y: 50 };
      return { url: b.url, pathname: b.pathname, x: p.x, y: p.y };
    });
    return NextResponse.json({ images, blob: true });
  } catch {
    // Blob store not configured yet — still authenticated.
    return NextResponse.json({ images: [], blob: false });
  }
}

// POST: upload a new hero image (multipart form field "file"). New images start
// centered (focal point 50%,50%).
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

// PATCH: set the focal point for one image. Body: { pathname, x, y } (x,y are 0–100).
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { pathname, x, y } = await req.json();
    if (!pathname || typeof pathname !== "string") return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const map = await readPositions();
    map[pathname] = clampPos(x, y);
    await writePositions(map);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "save_failed" }, { status: 500 });
  }
}

// DELETE: remove a hero image by its blob URL (?url=...&pathname=...).
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.searchParams.get("url");
  const pathname = req.nextUrl.searchParams.get("pathname");
  if (!url) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    await del(url);
    if (pathname) {
      try {
        const map = await readPositions();
        if (map[pathname]) { delete map[pathname]; await writePositions(map); }
      } catch {}
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete_failed" }, { status: 500 });
  }
}
