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
