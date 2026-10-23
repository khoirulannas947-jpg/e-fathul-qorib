/* E-Fathul Qorib — sinkronisasi progres antar perangkat.
   Menyalin riwayat bacaan, penanda, skor latihan & kalkulator ke server (/api/sinkron) agar ikut ke perangkat lain.
   Aturan: per data, yang terakhir diubah menang. Penanda & riwayat dari dua perangkat yang baru pertama kali tersambung digabung.
   Bila server tidak aktif / offline, aplikasi tetap berjalan seperti biasa (hanya lokal). */
(function () {
  "use strict";
  var KEYS = ["hist", "bm", "lat", "kal", "bab"];
  var P = "efq:", META = "efq:_sync";
  var LS;
  try { LS = window.localStorage; LS.getItem("x"); } catch (e) { return; }

  function rd(k) { try { return LS.getItem(P + k); } catch (e) { return null; } }
  function wr(k, v) { try { v == null ? LS.removeItem(P + k) : LS.setItem(P + k, v); } catch (e) {} }
  function meta() { try { return JSON.parse(LS.getItem(META)) || {}; } catch (e) { return {}; } }
  function saveMeta(m) { try { LS.setItem(META, JSON.stringify(m)); } catch (e) {} }
  function jp(s, d) { try { return JSON.parse(s); } catch (e) { return d; } }

  // Tandai data lokal yang berubah sejak sinkron terakhir (ts = sekarang).
  function scan(m) {
    var changed = false;
    KEYS.forEach(function (k) {
      var v = rd(k), e = m.k && m.k[k];
      m.k = m.k || {};
      if (!e) { if (v != null) { m.k[k] = { h: v, ts: Date.now(), baru: true }; changed = true; } return; }
      if ((v == null ? "" : v) !== e.h) { m.k[k] = { h: v == null ? "" : v, ts: Date.now() }; changed = true; }
    });
    return changed;
  }

  function gabung(k, lokal, jauh) { // hanya untuk sambungan pertama dua perangkat yang sama-sama sudah punya data
    var a = jp(lokal, null), b = jp(jauh, null);
    if (k === "bm" && Array.isArray(a) && Array.isArray(b)) {
      var map = {}; a.concat(b).forEach(function (x) { if (x && x.id && (!map[x.id] || (x.t || 0) > (map[x.id].t || 0))) map[x.id] = x; });
      return JSON.stringify(Object.keys(map).map(function (i) { return map[i]; }).sort(function (x, y) { return (y.t || 0) - (x.t || 0); }));
    }
    if (k === "hist" && Array.isArray(a) && Array.isArray(b)) {
      var m2 = {}; a.concat(b).forEach(function (x) { if (x && x.bab && (!m2[x.bab] || (x.t || 0) > (m2[x.bab].t || 0))) m2[x.bab] = x; });
      return JSON.stringify(Object.keys(m2).map(function (i) { return m2[i]; }).sort(function (x, y) { return (y.t || 0) - (x.t || 0); }).slice(0, 15));
    }
    return null;
  }

  var jalan = false, tunda = null, mati = false;

  function api(method, body, keep) {
    return fetch("/api/sinkron", {
      method: method, credentials: "same-origin", cache: "no-store", keepalive: !!keep,
      headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined,
    });
  }

  async function sinkron(opsi) {
    if (jalan || mati) return;
    jalan = true;
    try {
      var r = await api("GET");
      if (r.status === 401 || r.status === 501 || r.status === 402 || r.status === 403) { if (r.status !== 401) mati = true; return; }
      if (!r.ok) return;
      var srv = await r.json(), jauh = srv.data || {}, m = meta(), ubahLokal = false;
      // Perangkat dipakai akun lain sebelumnya: kosongkan data lokal agar tidak bocor ke akun ini.
      if (m.uid && srv.uid && m.uid !== srv.uid) { KEYS.forEach(function (k) { wr(k, null); }); m = {}; ubahLokal = true; }
      m.uid = srv.uid || m.uid;
      scan(m);
      var kirim = {};
      KEYS.forEach(function (k) {
        var l = m.k && m.k[k], s = jauh[k], lv = rd(k);
        if (s && l && l.baru && lv != null) { // sambungan pertama: kedua sisi sudah punya data
          var g = gabung(k, lv, s.v);
          if (g != null) { wr(k, g); m.k[k] = { h: g, ts: Date.now() }; kirim[k] = { v: g, ts: m.k[k].ts }; }
          else { wr(k, s.v); m.k[k] = { h: s.v, ts: s.ts }; }
          ubahLokal = true; return;
        }
        if (s && (!l || s.ts > l.ts)) { wr(k, s.v); m.k = m.k || {}; m.k[k] = { h: s.v, ts: s.ts }; ubahLokal = true; }
        else if (l && lv != null && (!s || l.ts > s.ts)) { kirim[k] = { v: lv, ts: l.ts }; delete l.baru; }
        else if (l && l.baru) delete l.baru;
      });
      saveMeta(m);
      if (Object.keys(kirim).length) await api("PUT", { uid: m.uid, data: kirim });
      // Data baru dari perangkat lain: muat ulang sekali agar tampilan memakai data itu.
      if (ubahLokal && opsi && opsi.muatUlang) {
        var kunci = "efq:_sinkron_reload";
        var sudah = false; try { sudah = sessionStorage.getItem(kunci) === "1"; sessionStorage.setItem(kunci, "1"); } catch (e) {}
        if (!sudah) location.reload();
      }
    } catch (e) { /* offline: coba lagi nanti */ } finally { jalan = false; }
  }

  // Perubahan lokal -> kirim (ditunda beberapa detik agar tidak terlalu sering).
  function jadwal(ms) { clearTimeout(tunda); tunda = setTimeout(function () { var m = meta(); if (scan(m)) { saveMeta(m); } sinkron(); }, ms); }
  var terakhir = null;
  function pantau() {
    var s = KEYS.map(function (k) { return rd(k); }).join("\u0001");
    if (terakhir !== null && s !== terakhir) jadwal(4000);
    terakhir = s;
  }

  function mulai() {
    sinkron({ muatUlang: true }).then(function () { terakhir = KEYS.map(function (k) { return rd(k); }).join("\u0001"); setInterval(pantau, 3000); });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") sinkron({ muatUlang: false }); else pantau(); });
    window.addEventListener("pagehide", function () { var m = meta(); if (scan(m)) saveMeta(m); var k = {}; KEYS.forEach(function (n) { var e = m.k && m.k[n], v = rd(n); if (e && v != null) k[n] = { v: v, ts: e.ts }; }); if (m.uid) { try { api("PUT", { uid: m.uid, data: k }, true); } catch (e) {} } });
  }
  window.EFQSync = { sinkron: sinkron };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai); else mulai();
})();
