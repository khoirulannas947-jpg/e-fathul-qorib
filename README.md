# E-Fathul Qorib

Kitab Fathul Qorib (syarah Ibnu Qasim al-Ghazzi atas matan at-Taqrib) lengkap: makna dan kedudukan setiap kata, terjemah, i'rab, penjelasan per paragraf, serta mind map tiap bab dan kitab.

- `index.html` + `data/*.json`: situs statis yang di-deploy (Vercel, tanpa build).
- `sumber/`: bahan mentah (data paragraf, mind map, template, `build.js`). Untuk membangun ulang: `cd sumber && node build.js`, lalu salin `out/index.html` (dibungkus doctype) dan `out/data/` ke akar repo.

Teks Arab dari edisi digital OpenITI (Shamela0035120), diberi harakat. Makna, i'rab, penjelasan, dan mind map adalah alat bantu belajar; cocokkan dengan kitab cetak dan bimbingan guru.

## Pengaturan opsional (Environment Variables di Vercel)

- `ALLOWED_EMAILS` — daftar akun yang boleh masuk, dipisah koma: alamat lengkap (`budi@gmail.com`) atau seluruh domain (`@pesantren.sch.id`). Kosong = semua akun yang login diizinkan. Hanya email yang sudah terverifikasi (mis. login Google) yang diterima; akun email+sandi yang belum diverifikasi akan ditolak bila daftar ini diisi.
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `TANYA_LIMIT_HARIAN` — fitur Tanya AI (batas harian per pengguna, bawaan 30).
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` (atau `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) — bila dipasang (Upstash Redis / Vercel KV), hitungan batas harian Tanya AI disimpan permanen dan berlaku di semua server; bila tidak, memakai memori dan bisa tereset saat server dimulai ulang.

## Langganan berbayar (opsional)

Aktif bila `AKSES_BERBAYAR=on`. Wajib: Redis REST (`KV_REST_API_URL`/`KV_REST_API_TOKEN` atau `UPSTASH_REDIS_REST_*`) dan `ADMIN_EMAILS`.

- `AKSES_BERBAYAR` — `on` untuk mewajibkan langganan aktif. Tanpa ini, perilaku lama (semua akun yang login boleh).
- `ADMIN_EMAILS` — email admin (dipisah koma, harus terverifikasi). Admin selalu punya akses penuh dan boleh mengelola langganan.
- `TRIAL_HARI` — masa coba gratis untuk akun baru, mis. `3` (sekali per email). Kosong/0 = tanpa masa coba.
- `ADMIN_TOKEN` — token rahasia (min. 16 karakter) untuk skrip/webhook pembayaran memanggil `/api/admin-akses`.
- `KONTAK_PEMBELIAN` — nomor WhatsApp (`6281234567890`) atau tautan; muncul sebagai tombol di halaman `/langganan`.

Status akses disimpan di Redis: kunci `akses:<email>` = waktu berakhir (ms). Pengguna tanpa langganan aktif diarahkan ke `/langganan`; data & API menjawab 402. Email harus terverifikasi (Google) agar tidak bisa dipalsukan.

Mengelola langganan (POST `/api/admin-akses`, dengan login admin atau `Authorization: Bearer <ADMIN_TOKEN>`):

```
curl -X POST https://DOMAIN/api/admin-akses -H "Authorization: Bearer $ADMIN_TOKEN" -H "content-type: application/json" \
  -d '{"aksi":"beri","email":"budi@gmail.com","hari":30}'      # tambah 30 hari (menumpuk dari sisa masa aktif)
  -d '{"aksi":"cabut","email":"budi@gmail.com"}'               # akhiri langganan
  -d '{"aksi":"cek","email":"budi@gmail.com"}'                 # lihat status
  -d '{"aksi":"daftar"}'                                       # semua pelanggan
```

Payment gateway nantinya cukup memanggil `berikanAkses(email, hari)` (di `akses-lib.js`) dari webhook, atau endpoint di atas.

### Batas perangkat & verifikasi email
- `MAKS_PERANGKAT` — jumlah perangkat maksimum per akun (mis. `2`). Kosong/0 = tanpa batas. Perangkat dikenali dari ID acak di cookie `efq_dev`; perangkat yang tidak dipakai 30 hari dilepas otomatis. Pengguna bisa mengeluarkan perangkat lain sendiri dari halaman `/langganan` (sekali per 24 jam); admin memakai `{"aksi":"reset-perangkat","email":"..."}`.
- Pendaftaran/login email+sandi kini mewajibkan verifikasi email: tautan verifikasi dikirim otomatis, dan akun baru bisa masuk setelah tautan diklik. Login Google sudah otomatis terverifikasi.
