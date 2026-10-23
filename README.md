# E-Fathul Qorib

Kitab Fathul Qorib (syarah Ibnu Qasim al-Ghazzi atas matan at-Taqrib) lengkap: makna dan kedudukan setiap kata, terjemah, i'rab, penjelasan per paragraf, serta mind map tiap bab dan kitab.

- `index.html` + `data/*.json`: situs statis yang di-deploy (Vercel, tanpa build).
- `sumber/`: bahan mentah (data paragraf, mind map, template, `build.js`). Untuk membangun ulang: `cd sumber && node build.js`, lalu salin `out/index.html` (dibungkus doctype) dan `out/data/` ke akar repo.

Teks Arab dari edisi digital OpenITI (Shamela0035120), diberi harakat. Makna, i'rab, penjelasan, dan mind map adalah alat bantu belajar; cocokkan dengan kitab cetak dan bimbingan guru.

## Pengaturan opsional (Environment Variables di Vercel)

- `ALLOWED_EMAILS` — daftar akun yang boleh masuk, dipisah koma: alamat lengkap (`budi@gmail.com`) atau seluruh domain (`@pesantren.sch.id`). Kosong = semua akun yang login diizinkan. Hanya email yang sudah terverifikasi (mis. login Google) yang diterima; akun email+sandi yang belum diverifikasi akan ditolak bila daftar ini diisi.
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `TANYA_LIMIT_HARIAN` — fitur Tanya AI (batas harian per pengguna, bawaan 30).
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` (atau `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) — bila dipasang (Upstash Redis / Vercel KV), hitungan batas harian Tanya AI disimpan permanen dan berlaku di semua server; bila tidak, memakai memori dan bisa tereset saat server dimulai ulang.
