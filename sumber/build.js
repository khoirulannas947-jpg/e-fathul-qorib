// Rakit E-Fathul Qorib: halaman + data JSON per kitab
const fs = require("fs"), path = require("path");
const D = __dirname, OUT = path.join(D, "out");
const kitab = [], babs = [], paras = [];
global.KITAB = (id, title, ar) => kitab.push({ id, title, ar });
global.BAB = (k, id, title, ar, desc) => babs.push({ k, id, title, ar, desc });
global.P = o => paras.push(o);
const mms = {}; global.MM = (id, txt) => { if (mms[id]) console.log("MM ganda", id); mms[id] = txt; };
eval(fs.readFileSync(path.join(D, "babs.js"), "utf8"));
for (const f of fs.readdirSync(path.join(D, "data")).sort()) eval(fs.readFileSync(path.join(D, "data", f), "utf8"));
if (fs.existsSync(path.join(D, "mm"))) for (const f of fs.readdirSync(path.join(D, "mm")).sort()) eval(fs.readFileSync(path.join(D, "mm", f), "utf8"));

const codes = new Set("mb fa nf ii kh ki mq mf mm ml zf ms hl tm na ma bd ab mt tk fi jr mj hr".split(" "));
const babIds = new Set(babs.map(b => b.id));
let errs = 0, words = 0;
for (const p of paras) {
  if (!babIds.has(p.bab)) { console.log("bab tak terdaftar", p.id, p.bab); errs++; }
  for (const l of p.w.trim().split("\n")) {
    words++;
    const [a, t, k] = l.split("|").map(x => (x || "").trim());
    if (!a || !t || t === "-" || !codes.has(k)) { console.log("kata rusak", p.id, l); errs++; }
  }
  for (const l of (p.i || "").trim().split("\n")) if (l && !l.includes("::")) { console.log("irab rusak", p.id, l); errs++; }
  if (!p.t || !p.s) { console.log("t/s kosong", p.id); errs++; }
}
let mmNodes = 0;
for (const [id, txt] of Object.entries(mms)) {
  if (!babIds.has(id)) { console.log("MM bab tak dikenal", id); errs++; continue; }
  const n = paras.filter(p => p.bab === id).length; let prev = -1, first = true;
  for (const l of txt.split("\n")) {
    if (!l.trim()) continue; mmNodes++;
    const ind = l.match(/^ */)[0].length;
    if (ind % 2 || ind / 2 > prev + 1 || (first && ind)) { console.log("MM indentasi", id, JSON.stringify(l)); errs++; }
    prev = ind / 2; first = false;
    const m = l.trim().match(/\s@(\d+)(?:-(\d+))?$/);
    if (m && (+m[1] < 1 || +(m[2] || m[1]) > n || +(m[2]||m[1]) < +m[1])) { console.log("MM ref di luar", id, n, l.trim()); errs++; }
    if (/@/.test(l) && !m) { console.log("MM ref rusak", id, l.trim()); errs++; }
  }
}
const ids = paras.map(p => p.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) { console.log("id ganda", dup); errs++; }

fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
const index = kitab.map(k => ({ ...k, babs: babs.filter(b => b.k === k.id).map(b => ({ id: b.id, title: b.title, ar: b.ar, desc: b.desc, n: paras.filter(p => p.bab === b.id).length, w: paras.filter(p => p.bab === b.id).reduce((a, p) => a + p.w.trim().split("\n").length, 0) })) }));
for (const k of kitab) {
  const ps = paras.filter(p => babs.find(b => b.id === p.bab)?.k === k.id).map(({ id, bab, matan, w, t, i, s }) => ({ id, bab, matan: !!matan, w: w.trim(), t, i: (i || "").trim(), s: s.trim() }));
  const mm = {}; for (const b of babs.filter(b => b.k === k.id)) if (mms[b.id]) mm[b.id] = mms[b.id].replace(/^\n+|\s+$/g, "");
  if (ps.length) fs.writeFileSync(path.join(OUT, "data", k.id + ".json"), JSON.stringify({ p: ps, mm }));
}
const tpl = fs.readFileSync(path.join(D, "template.html"), "utf8");
let app = fs.readFileSync(path.join(D, "app.js"), "utf8");
// Fitur tambahan (latihan, kalkulator): pustaka murni dulu, lalu tampilan, disisipkan ke dalam lingkup app.js
const FD = path.join(D, "fitur"); let fiturJs = "", fiturCss = "";
if (fs.existsSync(FD)) {
  const rd = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith(".js")).sort().map(f => "/* ---- fitur/" + path.basename(d) + "/" + f + " ---- */\n" + fs.readFileSync(path.join(d, f), "utf8")).join("\n") : "";
  fiturJs = rd(path.join(FD, "lib")) + "\n" + rd(FD);
  if (fs.existsSync(path.join(FD, "fitur.css"))) fiturCss = fs.readFileSync(path.join(FD, "fitur.css"), "utf8");
}
app = app.replace("/*__FITUR__*/", () => fiturJs);
const tplCss = tpl.replace("/*__FITUR_CSS__*/", () => fiturCss);
const html = tplCss.replace("/*__DATA__*/", () => "<script>window.FQINDEX=" + JSON.stringify(index).replace(/</g, "\\u003c") + "</script>").replace("/*__APP__*/", () => app);
fs.writeFileSync(path.join(OUT, "index.html"), html);
const files = fs.readdirSync(path.join(OUT, "data")).map(f => [f, fs.statSync(path.join(OUT, "data", f)).size]);
console.log(errs ? errs + " MASALAH" : "ok", "| paragraf", paras.length, "| kata", words, "| bab", babs.length, "| mindmap", Object.keys(mms).length, "simpul", mmNodes, "| file", JSON.stringify(files));
