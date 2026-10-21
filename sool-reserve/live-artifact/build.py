import json, subprocess, os
d = os.path.dirname(os.path.abspath(__file__))
os.chdir(d)
subprocess.run(["npx", "tailwindcss", "-c", f"{d}/tw.config.cjs", "-i", f"{d}/tw.input.css", "-o", f"{d}/tw.css", "--minify"], cwd="/home/user/beauty-direction-test/sool-reserve", check=True, capture_output=True)
css = open("tw.css").read()
art = open("art.json").read().replace("</", "<\\/")
head = open("head.html").read().replace("<style>/*TW*/</style>", "<style>" + css + "</style>")
js = "\n".join(open(f).read() for f in ["app1.js", "app2.js", "app3.js", "app5.js", "app4.js"])
page = head + '\n<script id="art-data" type="application/json">' + art + "</script>\n<script>\n" + js + "\n</script>\n"
open("index.html", "w").write(page)
data = json.load(open("data.json"))
mock = open("mock.js").read().replace("__DATA__", json.dumps(data, ensure_ascii=False))
open("test.html", "w").write("<meta charset=\"utf-8\">" + page.replace('<div id="app"></div>', "<script>" + mock + "</script>\n<div id=\"app\"></div>", 1))
print("index", len(page))
