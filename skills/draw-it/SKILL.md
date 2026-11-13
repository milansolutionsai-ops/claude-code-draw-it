---
name: draw-it
description: On-demand hand-drawn explainer of a system, flow or feature. Explores the code, works out what runs where and in what order, and draws one annotated diagram (rendered as SVG from a JSON spec, no image model). Use ONLY when the user asks to draw, map, sketch or picture how something works ("draw it", "draw how X works", "I don't get what we built, draw it", "make a diagram of this for the team"). Not automatic after builds.
---

# draw-it

People build systems with AI, or inherit them, and then can't see how the pieces fit. This
skill turns one flow into one picture the user can read in a minute: the pieces, where each
one runs, the order things happen, what costs money and where it breaks.

## 1. Pin down two things before reading any code

- **What to draw.** One flow or feature, not a whole repo. A whole app is a 40-box mess nobody
  reads. If the user names a whole project, pick the flow they're most likely to be confused by
  (or the one this session touched) and say which one you picked in one line. Offer the others
  as follow-ups.
- **Who it's for: the builder or the team.** Never both in one picture. If the user didn't
  say, ask one question with those two choices. Don't guess.

| | For the builder (`"audience": "me"`) | For the team (`"audience": "team"`) |
|---|---|---|
| Purpose | Understand and debug it | Brief a non-technical colleague or client |
| Lanes | Where code runs, named after the real thing: Your machine · Browser · App server · Database · Scheduled jobs · Outside services | What it does: What you do · Behind the scenes · Where it's saved · Runs by itself · Other tools |
| Node detail line | Where it lives, in plain words ("API route, runs on each request", "cron, every 5 min") | What it does for them |
| Notes (red) | What breaks, what's silent when it fails, what costs money | Only what changes how they work |
| Allowed words | Tool and table names are fine. Explain any runtime term in the same line. | No code, file, table or route names. No tech terms at all. |

Name lanes after what the project actually uses ("Vercel server", "Postgres", "GitHub
Actions"), not the generic labels above. For the builder, the most useful thing the picture
can show is where each piece runs and where its output lands (a database row, a log line, an
email, a file, a chat message). That is usually the part nobody can explain.

## 2. Explore, then verify

- Use a code-intelligence tool (symbol search, LSP) if one is available; otherwise grep and read
  entry points.
- Trace the real path: what starts it (a click, a cron, a webhook, a CLI command), what each
  step calls, what it writes, what fires next. Read cron schedules, env kill switches and
  "skip if already done" checks: they're usually the non-obvious part.
- Every box and arrow must trace to code you read in this session. No inferred or "probably"
  steps. If you couldn't verify a piece, leave it out and say so under the takeaways.

## 3. Write the spec (JSON) to a temp or scratch folder

```json
{
  "title": "How a waitlist signup becomes a weekly email",
  "subtitle": "tiny-waitlist-app, from the signup form to the Monday digest",
  "audience": "me",
  "lanes": [{"id": "browser", "label": "Browser", "sub": "the visitor's tab"}],
  "nodes": [{"id": "form", "lane": "browser", "row": 0, "label": "Signup form", "detail": "web/signup.html", "note": "optional red line", "tone": "cost | warn (optional)"}],
  "steps": [{"from": "form", "to": "api", "text": "Full sentence for the numbered list.", "dashed": false, "tone": "cost | warn (optional)", "at": 0.5}],
  "takeawaysTitle": "If it breaks, look here",
  "takeaways": ["3-5 short lines"]
}
```

Rules that keep it readable:
- **12 boxes max, 3-6 lanes.** Drop lanes with nothing in them.
- `row` is the vertical slot in a lane (0 at the top). No two boxes share a lane and row. Put
  boxes that talk to each other on nearby rows so arrows stay short.
- Labels: 2-4 words. Detail: one short line. Notes: one short line, only when it matters.
- `steps` are in the order things happen; the arrow numbers come from that order. Each `text`
  is one plain sentence a 12-year-old could follow. Use `dashed` for "only sometimes".
- `at` (0-1) moves a number badge along its arrow when two badges collide.
- `tone: "cost"` for anything that bills per run (model calls, paid APIs); `"warn"` for silent
  failures or gotchas.
- Optional `"audienceLabel"` overrides the pill under the subtitle (default "For the builder"
  or "For the team").

## 4. Render, look, fix

```bash
python ~/.claude/skills/draw-it/render.py <spec.json> <out.html>
```

`render.py` checks the spec (unknown lanes, arrows to missing boxes, two boxes in one slot)
and exits with a clear error instead of drawing a broken picture.

- Save `out.html` inside the user's working directory, under `diagrams/<slug>-<me|team>.html`
  (no spaces), so it opens with one click. Not inside a repo the user doesn't own unless they ask.
- If you have a browser tool, open the file and screenshot it. Fix overlapping badges (`at`),
  crossing arrows (move rows) and cramped boxes, then re-render. Two passes max. Without a
  browser tool, tell the user to open the file and say what to check.
- For a team version the user wants to share, the screenshot is the PNG.

## 5. Hand it over

Link the file, then 3 lines max in plain English: what the picture shows, the one thing most
worth noticing, and anything you left out because you couldn't verify it.
