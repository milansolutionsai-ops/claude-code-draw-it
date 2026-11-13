// GET /api/confirm?token=...  (runs when the visitor clicks the link in the email)
import { db } from "../db/client.js";

export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token");
  const updated = await db.run("update subscribers set status = 'confirmed' where token = $1", [token]);
  return new Response(updated.count ? "You're on the list." : "Link expired.", { status: updated.count ? 200 : 404 });
}
