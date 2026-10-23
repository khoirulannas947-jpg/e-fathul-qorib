// Status langganan pengguna yang sedang login (untuk halaman /langganan).
import { sessionFrom } from "../middleware.js";
import { aksesBerbayarAktif, cekAkses, isAdmin, cekPerangkat, lepasPerangkat, cookieDev } from "../akses-lib.js";

export default async function handler(req, res) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  const sesi = await sessionFrom(req.headers.cookie || "");
  if (!sesi) { res.statusCode = 401; return res.end(JSON.stringify({ error: "login_required" })); }
  if (req.method === "POST") {
    // Pengguna melepas perangkat lain (maksimal sekali per 24 jam); perangkat ini tetap terdaftar.
    if (!aksesBerbayarAktif() || !sesi.verified) { res.statusCode = 400; return res.end(JSON.stringify({ error: "tidak_berlaku" })); }
    try { await lepasPerangkat(sesi.email, cookieDev(req.headers.cookie), false); res.end(JSON.stringify({ ok: true })); }
    catch (e) { res.statusCode = e.message === "tunggu_24_jam" ? 429 : 503; res.end(JSON.stringify({ error: e.message })); }
    return;
  }
  const kontak = process.env.KONTAK_PEMBELIAN || "";
  const dasar = { email: sesi.email, terverifikasi: sesi.verified, kontak };
  if (!aksesBerbayarAktif() || isAdmin(sesi)) return res.end(JSON.stringify({ ...dasar, berbayar: aksesBerbayarAktif(), aktif: true, admin: isAdmin(sesi), sampai: null }));
  try {
    const st = sesi.verified ? await cekAkses(sesi.email) : { aktif: false, sampai: null };
    let perangkat = null;
    if (st.aktif && sesi.verified) { const d = await cekPerangkat(sesi.email, cookieDev(req.headers.cookie), false); if (d.maks) perangkat = { ok: d.ok, jumlah: d.jumlah, maks: d.maks }; }
    res.end(JSON.stringify({ ...dasar, berbayar: true, aktif: st.aktif, sampai: st.sampai || null, perangkat }));
  } catch (e) {
    res.statusCode = 503; res.end(JSON.stringify({ error: "layanan_sibuk" }));
  }
}
