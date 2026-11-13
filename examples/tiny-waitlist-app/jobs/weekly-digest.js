// Runs by itself every Monday at 09:00 (see schedule.json). Nobody clicks anything.
import { db } from "../db/client.js";
import { sendEmail } from "../lib/mailer.js";
import { summarize } from "../lib/llm.js";

export default async function run() {
  if (process.env.DIGEST_ENABLED !== "true") return; // kill switch

  const posts = await db.all("select title, body from posts where created_at > now() - interval '7 days'");
  if (posts.length === 0) return; // quiet week: no email at all

  const digest = await summarize(posts); // one model call per week, billed per token

  const people = await db.all("select email from subscribers where status = 'confirmed'");
  for (const { email } of people) {
    await sendEmail(email, "This week", digest); // billed per email
  }
}
