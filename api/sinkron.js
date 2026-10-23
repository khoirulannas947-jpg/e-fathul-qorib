// Sinkronisasi progres antar perangkat (riwayat bacaan, penanda, skor latihan, kalkulator).
// Tersimpan di Redis sebagai hash "sinkron:<uid>" (field = nama data). Per data berlaku "yang terbaru menang" (ts).
// GET  -> { uid, data: { hist: {v, ts}, ... } }
// PUT  -> { data: { hist: {v, ts}, ... } }  (hanya data yang lebih baru dari yang tersimpan yang diterima)
import { sessionFrom, isAllowed } from "../middleware.js";
import { redis, redisSiap } from "../akses-lib.js";

const KUNCI = ["hist", "bm", "lat", "kal", "bab"];
const MAKS_BYTE = 100 * 1024;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}
async function bacaBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let s = "";
  for await (const c of req) { s += c; if (s.length > 600 * 1024) break; }
  try { return JSON.parse(s || "{}"); } catch { return {}; }
}
const parse = (s) => { try { const o = JSON.parse(s); return o && typeof o.v === "string" && Number.isFinite(o.ts) ? o : null; } catch { return null; } };

export default async function handler(req, res) {
  const sesi = await sessionFrom(req.headers.cookie || "");
  if (!sesi) return json(res, 401, { error: "login_required" });
  if (!isAllowed(sesi)) return json(res, 403, { error: "tidak_diizinkan" });
  if (!redisSiap()) return json(res, 501, { error: "sinkron_tidak_aktif" });
  const key = "sinkron:" + sesi.sub;
  try {
    if (req.method === "GET") {
      const out = await redis([["HGETALL", key]]);
      const arr = (out && out[0] && out[0].result) || [];
      const data = {};
      for (let i = 0; i + 1 < arr.length; i += 2) { if (KUNCI.includes(arr[i])) { const o = parse(arr[i + 1]); if (o) data[arr[i]] = o; } }
      return json(res, 200, { uid: sesi.sub, data });
    }
    if (req.method === "PUT" || req.method === "POST") {
      const b = await bacaBody(req);
      if (b && b.uid && b.uid !== sesi.sub) return json(res, 409, { error: "akun_berbeda" }); // data milik akun lain di perangkat ini
      const masuk = b && b.data && typeof b.data === "object" ? b.data : {};
      const ada = Object.keys(masuk).filter((k) => KUNCI.includes(k) && masuk[k] && typeof masuk[k].v === "string" && Number.isFinite(masuk[k].ts) && masuk[k].v.length <= MAKS_BYTE);
      if (!ada.length) return json(res, 200, { ok: true, diterima: [] });
      const cur = await redis(ada.map((k) => ["HGET", key, k]));
      const cmds = [], diterima = [];
      ada.forEach((k, i) => {
        const lama = parse(cur[i] && cur[i].result);
        if (!lama || masuk[k].ts > lama.ts) { cmds.push(["HSET", key, k, JSON.stringify({ v: masuk[k].v, ts: Math.min(masuk[k].ts, Date.now() + 60000) })]); diterima.push(k); }
      });
      if (cmds.length) { cmds.push(["EXPIRE", key, 400 * 86400]); await redis(cmds); }
      return json(res, 200, { ok: true, diterima });
    }
    return json(res, 405, { error: "metode_tidak_didukung" });
  } catch (e) {
    return json(res, 503, { error: "layanan_sibuk" });
  }
}
