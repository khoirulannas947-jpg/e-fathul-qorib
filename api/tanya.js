// Vercel Function: "Tanya AI" per paragraf.
// - Hanya untuk pengguna yang login (cookie fb_session diverifikasi ulang di sini untuk mendapat uid).
// - Konteks jawaban diambil di server dari data kitab, jadi AI hanya menjawab seputar paragraf yang dibuka.
// - Kunci OpenAI disimpan di Environment Variables Vercel (OPENAI_API_KEY), tidak pernah dikirim ke browser.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sessionFrom, isAllowed } from "../middleware.js";

const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const DAILY_LIMIT = Number(process.env.TANYA_LIMIT_HARIAN || 30);
const KITAB_RE = /^[a-z]{2,20}$/;
const cache = new Map();

// Pembatas harian per pengguna. Bila Redis REST (Upstash / Vercel KV) dipasang lewat environment variable,
// hitungan disimpan permanen dan berlaku di semua instance server; bila tidak, memakai memori (fallback, bisa tereset).
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const memUsage = new Map();

async function redis(cmds) {
  const r = await fetch(REDIS_URL.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { authorization: "Bearer " + REDIS_TOKEN, "content-type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return r.json();
}
// Ambil satu jatah pertanyaan. Mengembalikan jumlah pemakaian setelah diambil.
async function ambilJatah(key) {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const out = await redis([["INCR", key], ["EXPIRE", key, 172800]]);
      const n = Number(out && out[0] && out[0].result);
      if (Number.isFinite(n)) return n;
    } catch (e) { console.error("kuota", e.message); }
  }
  const n = (memUsage.get(key) || 0) + 1;
  memUsage.set(key, n);
  return n;
}
async function kembalikanJatah(key) {
  if (REDIS_URL && REDIS_TOKEN) { try { await redis([["DECR", key]]); return; } catch {} }
  memUsage.set(key, Math.max(0, (memUsage.get(key) || 1) - 1));
}

const KED = {
  mb: "mubtada'", kh: "khabar", fa: "fa'il", nf: "na'ibul fa'il", ii: "isim inna/kana", ki: "khabar inna/kana", mq: "maqul qaul",
  mf: "maf'ul bih", mm: "maf'ul muthlaq", ml: "maf'ul li ajlih", zf: "zharaf", ms: "mustatsna", hl: "hal", tm: "tamyiz", na: "na'at",
  ma: "mudhaf ilaih", bd: "badal", ab: "'athaf bayan", mt: "ma'thuf", tk: "taukid", fi: "fi'il", jr: "huruf jar", mj: "majrur", hr: "huruf",
};

const SYSTEM = `Anda adalah "Ustadz AI", pendamping belajar kitab Fathul Qorib (syarah Ibnu Qasim al-Ghazzi atas matan Abu Syuja', fiqih madzhab Syafi'i) di aplikasi E-Fathul Qorib.
Tugas: menjawab pertanyaan pelajar tentang SATU paragraf kitab yang sedang dibuka. Data paragraf (teks Arab, makna per kata, kedudukan, terjemah, i'rab, penjelasan) diberikan di bawah.
Aturan:
1. Jawab dalam bahasa Indonesia yang jelas dan sopan. Kutip lafadz Arab berharakat bila membahas kata tertentu.
2. Pijakan utama adalah data paragraf. Untuk nahwu/sharaf dan fiqih Syafi'i boleh menambah penjelasan yang mapan dan masyhur; tandai bila itu tambahan di luar teks ("Sebagai tambahan, …").
3. Jangan mengarang dalil, nomor hadits, nama kitab, atau pendapat ulama. Bila tidak yakin, katakan terus terang.
4. Bila pertanyaan di luar paragraf/kitab ini atau meminta fatwa untuk kasus pribadi, jawab singkat bahwa itu di luar cakupan dan sarankan bertanya kepada guru/ustadz.
5. Ringkas: umumnya 2–5 paragraf pendek atau daftar poin. Tanpa tabel. Boleh **tebal** untuk istilah penting.`;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

async function loadKitab(k) {
  if (cache.has(k)) return cache.get(k);
  const file = path.join(process.cwd(), "data", k + ".json");
  const j = JSON.parse(await readFile(file, "utf8"));
  const paras = Array.isArray(j) ? j : j.p;
  cache.set(k, paras);
  return paras;
}

function konteks(p, judulBab) {
  const kata = p.w.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [a, t, k] = l.split("|").map((x) => (x || "").trim());
    const m = a.startsWith("*");
    return `${m ? a.slice(1) : a} — ${t} [${KED[k] || k}${m ? ", matan" : ""}]`;
  });
  return [
    `Bab: ${judulBab || p.bab}`,
    `Teks Arab: ${kata.map((x) => x.split(" — ")[0]).join(" ")}`,
    `Makna per kata:\n${kata.join("\n")}`,
    `Terjemah: ${p.t}`,
    `I'rab:\n${p.i || "-"}`,
    `Penjelasan:\n${p.s}`,
  ].join("\n\n");
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => { d += c; if (d.length > 20000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });

  const sesi = await sessionFrom(req.headers.cookie || "");
  if (!sesi) return json(res, 401, { error: "login_required" });
  if (!isAllowed(sesi)) return json(res, 403, { error: "tidak_diizinkan", pesan: "Akun ini belum diizinkan memakai fitur ini." });

  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, { error: "belum_aktif", pesan: "Fitur Tanya AI belum diaktifkan oleh pengelola (kunci OpenAI belum dipasang)." });
  }

  const body = await readBody(req);
  const kitab = String(body.kitab || "");
  const pid = String(body.pid || "");
  const tanya = String(body.q || "").trim().slice(0, 600);
  if (!KITAB_RE.test(kitab) || !pid || !tanya) return json(res, 400, { error: "input", pesan: "Pertanyaan belum lengkap." });

  const hari = new Date().toISOString().slice(0, 10);
  const key = "tanya:" + sesi.sub + ":" + hari;
  // Jatah diambil di muka (sebelum memanggil OpenAI) agar permintaan paralel tidak melewati batas; dikembalikan bila gagal.
  const n = (await ambilJatah(key)) - 1;
  if (n >= DAILY_LIMIT) { await kembalikanJatah(key); return json(res, 429, { error: "batas", pesan: `Batas ${DAILY_LIMIT} pertanyaan per hari sudah tercapai. Silakan lanjut besok.` }); }

  let p;
  try {
    p = (await loadKitab(kitab)).find((x) => x.id === pid);
  } catch {
    await kembalikanJatah(key);
    return json(res, 404, { error: "kitab", pesan: "Data kitab tidak ditemukan." });
  }
  if (!p) { await kembalikanJatah(key); return json(res, 404, { error: "paragraf", pesan: "Paragraf tidak ditemukan." }); }

  const riwayat = (Array.isArray(body.riwayat) ? body.riwayat : [])
    .slice(-6)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const messages = [
    { role: "system", content: SYSTEM + "\n\n=== DATA PARAGRAF ===\n" + konteks(p, String(body.judul || "").slice(0, 120)) },
    ...riwayat,
    { role: "user", content: tanya },
  ];

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: MODEL, messages, max_completion_tokens: 4000 }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const code = (j.error && (j.error.code || j.error.type)) || r.status;
      console.error("openai", r.status, code, j.error && j.error.message);
      const pesan = code === "insufficient_quota"
        ? "Saldo OpenAI pengelola habis. Fitur Tanya AI sementara tidak tersedia."
        : "Layanan AI sedang bermasalah. Coba lagi sebentar lagi.";
      await kembalikanJatah(key);
      return json(res, 502, { error: "ai", pesan });
    }
    const jawab = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!jawab) { await kembalikanJatah(key); return json(res, 502, { error: "kosong", pesan: "AI tidak memberi jawaban. Coba ulangi pertanyaannya." }); }
    const u = j.usage || {};
    console.log("tanya_usage", JSON.stringify({ model: MODEL, in: u.prompt_tokens, out: u.completion_tokens, reasoning: u.completion_tokens_details && u.completion_tokens_details.reasoning_tokens }));
    return json(res, 200, { jawab: jawab.trim(), sisa: DAILY_LIMIT - n - 1, token: { masuk: u.prompt_tokens, keluar: u.completion_tokens } });
  } catch (e) {
    console.error("tanya", e);
    await kembalikanJatah(key);
    return json(res, 502, { error: "jaringan", pesan: "Gagal menghubungi layanan AI. Coba lagi." });
  }
}
