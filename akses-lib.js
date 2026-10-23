// Langganan / hak akses berbayar. Data di Redis REST (Upstash / Vercel KV): kunci "akses:<email>" = waktu kedaluwarsa (ms epoch).
// Aktif bila environment variable AKSES_BERBAYAR=on. Hanya memakai fetch, jadi aman dipakai di middleware (Edge) maupun Function.
const env = (k) => (typeof process !== "undefined" && process.env && process.env[k]) || "";
const HARI = 86400000;
const cache = new Map(); // email -> { exp, until }

export const aksesBerbayarAktif = () => /^(on|1|true|ya)$/i.test(env("AKSES_BERBAYAR"));
const redisUrl = () => env("KV_REST_API_URL") || env("UPSTASH_REDIS_REST_URL");
const redisToken = () => env("KV_REST_API_TOKEN") || env("UPSTASH_REDIS_REST_TOKEN");
export const redisSiap = () => !!(redisUrl() && redisToken());

export async function redis(cmds) {
  const r = await fetch(redisUrl().replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { authorization: "Bearer " + redisToken(), "content-type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return r.json();
}

const daftar = (s) => String(s || "").split(/[,\n;]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
// Admin = ADMIN_EMAILS (email terverifikasi). Admin selalu punya akses penuh dan boleh mengelola langganan.
export function isAdmin(session, list = env("ADMIN_EMAILS")) {
  return !!(session && session.verified && session.email && daftar(list).includes(session.email));
}

const kunci = (email) => "akses:" + String(email).trim().toLowerCase();

// Status akses satu email. { aktif, sampai (ms|null), trial }
export async function cekAkses(email) {
  email = String(email || "").trim().toLowerCase();
  if (!email) return { aktif: false, sampai: null };
  const now = Date.now();
  const hit = cache.get(email);
  if (hit && hit.exp > now) return statusDari(hit.until, now);
  if (!redisSiap()) throw new Error("redis_belum_dipasang");
  let until = null;
  try {
    const out = await redis([["GET", kunci(email)]]);
    const v = out && out[0] && out[0].result;
    until = v == null ? null : Number(v);
    if (until !== null && !Number.isFinite(until)) until = null;
    // Pengguna baru: beri masa coba gratis sekali (TRIAL_HARI), tersimpan agar tidak bisa diulang.
    const trial = Number(env("TRIAL_HARI") || 0);
    if (until === null && trial > 0) {
      until = now + trial * HARI;
      const set = await redis([["SET", kunci(email), String(until), "NX"], ["GET", kunci(email)]]);
      const cur = Number(set && set[1] && set[1].result);
      if (Number.isFinite(cur)) until = cur;
    }
  } catch (e) {
    if (hit) return statusDari(hit.until, now); // Redis gangguan: pakai data terakhir yang diketahui
    throw e;
  }
  cache.set(email, { until, exp: now + 60000 });
  return statusDari(until, now);
}
function statusDari(until, now) {
  return { aktif: until !== null && until > now, sampai: until };
}

// Tambah masa aktif sebanyak `hari` dari sisa masa aktif (atau dari sekarang bila sudah habis). Dipakai admin & nanti webhook pembayaran.
export async function berikanAkses(email, hari) {
  email = String(email || "").trim().toLowerCase();
  hari = Number(hari);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("email_tidak_valid");
  if (!Number.isFinite(hari) || hari <= 0 || hari > 3660) throw new Error("hari_tidak_valid");
  const out = await redis([["GET", kunci(email)]]);
  const cur = Number(out && out[0] && out[0].result);
  const dasar = Number.isFinite(cur) && cur > Date.now() ? cur : Date.now();
  const until = dasar + hari * HARI;
  await redis([["SET", kunci(email), String(until)]]);
  cache.delete(email);
  return until;
}
export async function cabutAkses(email) {
  email = String(email || "").trim().toLowerCase();
  await redis([["SET", kunci(email), "0"]]); // 0 = sudah habis (tetap tercatat, jadi tidak dapat masa coba lagi)
  cache.delete(email);
}
export async function daftarAkses(maks = 1000) {
  let cursor = "0", keys = [];
  do {
    const out = await redis([["SCAN", cursor, "MATCH", "akses:*", "COUNT", "200"]]);
    const r = out && out[0] && out[0].result;
    if (!r) break;
    cursor = String(r[0]);
    keys = keys.concat(r[1]);
  } while (cursor !== "0" && keys.length < maks);
  keys = keys.slice(0, maks);
  if (!keys.length) return [];
  const vals = await redis(keys.map((k) => ["GET", k]));
  return keys.map((k, i) => ({ email: k.slice(6), sampai: Number(vals[i] && vals[i].result) || 0 })).sort((a, b) => b.sampai - a.sampai);
}

// ---- Batas perangkat per akun (MAKS_PERANGKAT, 0/kosong = tanpa batas) ----
// Perangkat dikenali dari cookie "efq_dev" (ID acak yang dibuat auth-client.js). Disimpan di Redis sebagai ZSET "dev:<email>" (skor = terakhir dipakai).
// Perangkat yang tidak dipakai 30 hari dilepas otomatis.
export const maksPerangkat = () => Math.max(0, Math.floor(Number(env("MAKS_PERANGKAT") || 0)) || 0);
export const idPerangkatValid = (d) => /^[a-z0-9-]{16,64}$/i.test(String(d || ""));
const devCache = new Map(); // "email|dev" -> { exp, val }

export async function cekPerangkat(email, dev, daftar = true) {
  const maks = maksPerangkat();
  if (!maks) return { ok: true, maks: 0, jumlah: 0, terdaftar: true };
  email = String(email || "").trim().toLowerCase();
  if (!idPerangkatValid(dev)) return { ok: false, alasan: "tanpa_id", maks, jumlah: 0, terdaftar: false };
  const now = Date.now(), ck = email + "|" + dev;
  const hit = daftar && devCache.get(ck);
  if (hit && hit.exp > now) return hit.val;
  const k = "dev:" + email;
  const out = await redis([["ZREMRANGEBYSCORE", k, "-inf", String(now - 30 * HARI)], ["ZSCORE", k, dev], ["ZCARD", k]]);
  const ada = !!(out[1] && out[1].result != null);
  const n = Number(out[2] && out[2].result) || 0;
  let ok = ada || n < maks;
  if (ok && daftar) await redis([["ZADD", k, String(now), dev], ["EXPIRE", k, 40 * 86400]]);
  const val = { ok, maks, jumlah: ok && daftar && !ada ? n + 1 : n, terdaftar: ada || (ok && daftar) };
  if (ok && daftar) devCache.set(ck, { exp: now + 5 * 60000, val });
  return val;
}
// Lepas semua perangkat lain (kecuali `simpan`). Pengguna dibatasi 1x per 24 jam; admin (paksa=true) tanpa batas.
export async function lepasPerangkat(email, simpan, paksa = false) {
  email = String(email || "").trim().toLowerCase();
  if (!paksa) {
    const r = await redis([["SET", "devreset:" + email, "1", "NX", "EX", "86400"]]);
    if (!(r && r[0] && r[0].result === "OK")) throw new Error("tunggu_24_jam");
  }
  const cmds = [["DEL", "dev:" + email]];
  if (idPerangkatValid(simpan)) cmds.push(["ZADD", "dev:" + email, String(Date.now()), simpan], ["EXPIRE", "dev:" + email, 40 * 86400]);
  await redis(cmds);
  for (const k of [...devCache.keys()]) if (k.startsWith(email + "|")) devCache.delete(k);
}
export function cookieDev(header) {
  for (const part of String(header || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === "efq_dev") return part.slice(i + 1).trim();
  }
  return "";
}
