// Status langganan pengguna yang sedang login (untuk halaman /langganan).
import { sessionFrom } from "../middleware.js";
import { aksesBerbayarAktif, cekAkses, isAdmin } from "../akses-lib.js";

export default async function handler(req, res) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  const sesi = await sessionFrom(req.headers.cookie || "");
  if (!sesi) { res.statusCode = 401; return res.end(JSON.stringify({ error: "login_required" })); }
  const kontak = process.env.KONTAK_PEMBELIAN || "";
  const dasar = { email: sesi.email, terverifikasi: sesi.verified, kontak };
  if (!aksesBerbayarAktif() || isAdmin(sesi)) return res.end(JSON.stringify({ ...dasar, berbayar: aksesBerbayarAktif(), aktif: true, admin: isAdmin(sesi), sampai: null }));
  try {
    const st = sesi.verified ? await cekAkses(sesi.email) : { aktif: false, sampai: null };
    res.end(JSON.stringify({ ...dasar, berbayar: true, aktif: st.aktif, sampai: st.sampai || null }));
  } catch (e) {
    res.statusCode = 503; res.end(JSON.stringify({ error: "layanan_sibuk" }));
  }
}
