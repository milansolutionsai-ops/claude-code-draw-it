// POST /api/signup  (runs on the app server for each request)
import { db } from "../db/client.js";
import { sendEmail } from "../lib/mailer.js";

export async function POST(req) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) return new Response("bad email", { status: 400 });

  // Already on the list? Do nothing, so a double click doesn't send two emails.
  const existing = await db.one("select id from subscribers where email = $1", [email]);
  if (existing) return new Response("ok");

  const token = crypto.randomUUID();
  await db.run("insert into subscribers (email, status, token) values ($1, 'pending', $2)", [email, token]);

  // Paid email provider, billed per email sent. A failure here is only logged:
  // the row stays 'pending' and the visitor never gets a confirm link.
  try {
    await sendEmail(email, "Confirm your spot", `https://example.com/api/confirm?token=${token}`);
  } catch (err) {
    console.error("confirm email failed", err);
  }
  return new Response("ok");
}
