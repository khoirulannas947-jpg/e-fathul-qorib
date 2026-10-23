// Kelola langganan (khusus admin). Dua cara masuk:
//  1) Login sebagai email yang ada di ADMIN_EMAILS (cookie sesi), atau
//  2) Header "Authorization: Bearer <ADMIN_TOKEN>" (untuk skrip / nanti webhook pembayaran).
// POST JSON: {"aksi":"beri","email":"budi@gmail.com","hari":30} | {"aksi":"cabut","email":"..."} | {"aksi":"cek","email":"..."} | {"aksi":"daftar"} | {"aksi":"reset-perangkat","email":"..."}
import { timingSafeEqual } from "node:crypto";
import { sessionFrom } from "../middleware.js";
import { isAdmin, redisSiap, cekAkses, berikanAkses, cabutAkses, daftarAkses, lepasPerangkat } from "../akses-lib.js";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}
function tokenCocok(header) {
  const t = process.env.ADMIN_TOKEN || "";
  const m = /^Bearer (.+)$/.exec(header || "");
  if (!t || t.length < 16 || !m) return false;
  const a = Buffer.from(m[1]), b = Buffer.from(t);
  return a.length === b.length && timingSafeEqual(a, b);
}
async function bacaBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let s = "";
  for await (const c of req) s += c;
  try { return JSON.parse(s || "{}"); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "gunakan_POST" });
  let ok = tokenCocok(req.headers.authorization);
  if (!ok) ok = isAdmin(await sessionFrom(req.headers.cookie || ""));
  if (!ok) return json(res, 403, { error: "bukan_admin" });
  if (!redisSiap()) return json(res, 500, { error: "redis_belum_dipasang" });
  const b = await bacaBody(req);
  try {
    if (b.aksi === "beri") { const s = await berikanAkses(b.email, b.hari); return json(res, 200, { ok: true, email: b.email, sampai: new Date(s).toISOString() }); }
    if (b.aksi === "cabut") { await cabutAkses(b.email); return json(res, 200, { ok: true }); }
    if (b.aksi === "cek") { const st = await cekAkses(b.email); return json(res, 200, { aktif: st.aktif, sampai: st.sampai ? new Date(st.sampai).toISOString() : null }); }
    if (b.aksi === "reset-perangkat") { await lepasPerangkat(b.email, "", true); return json(res, 200, { ok: true }); }
    if (b.aksi === "daftar") { const d = await daftarAkses(); return json(res, 200, { jumlah: d.length, pengguna: d.map((x) => ({ email: x.email, sampai: x.sampai ? new Date(x.sampai).toISOString() : null, aktif: x.sampai > Date.now() })) }); }
    return json(res, 400, { error: "aksi_tidak_dikenal" });
  } catch (e) {
    return json(res, 400, { error: String(e.message || e) });
  }
}
