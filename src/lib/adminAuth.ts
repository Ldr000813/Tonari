import { NextRequest } from "next/server";

// Admin is authenticated by a password kept in an environment variable
// (ADMIN_PASSWORD). The browser sends it in the "x-admin-password" header.
export function isAdmin(req: NextRequest): boolean {
  const env = process.env.ADMIN_PASSWORD || "";
  const sent = req.headers.get("x-admin-password") || "";
  return env.length > 0 && sent === env;
}
