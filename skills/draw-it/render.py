"""Fill the draw-it template with a diagram spec. Usage: python -I render.py spec.json out.html"""
import html, json, sys
from pathlib import Path

spec_path, out_path = Path(sys.argv[1]), Path(sys.argv[2])
spec = json.loads(spec_path.read_text(encoding="utf-8"))
ids = {n["id"] for n in spec["nodes"]}
lanes = {l["id"] for l in spec["lanes"]}
bad = [n["id"] for n in spec["nodes"] if n["lane"] not in lanes]
bad += [f'{s["from"]}->{s["to"]}' for s in spec["steps"] if s["from"] not in ids or s["to"] not in ids]
taken = {}
for n in spec["nodes"]:
    key = (n["lane"], n["row"])
    if key in taken:
        bad.append(f'{n["id"]} overlaps {taken[key]} (lane {key[0]}, row {key[1]})')
    taken[key] = n["id"]
if bad:
    sys.exit("spec errors: " + "; ".join(bad))
tpl = (Path(__file__).parent / "template.html").read_text(encoding="utf-8")
data = json.dumps(spec, ensure_ascii=False).replace("</", "<\\/")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(tpl.replace("__TITLE__", html.escape(spec["title"])).replace("__DATA__", data), encoding="utf-8")
print(out_path)
