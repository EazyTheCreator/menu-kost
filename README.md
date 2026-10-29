# Menu Masak Mingguan

Aplikasi web untuk merencanakan menu masak seminggu, menyusun daftar belanja secara otomatis, dan membandingkannya dengan anggaran dapur.

- Pilih menu per hari untuk sarapan, siang, dan malam; atur porsi sekali makan
- Opsi **Sisa masakan** untuk masak sekali dan makan dua kali, sehingga bahan dihitung dua porsi
- **Isi otomatis menu hemat**: memilih kombinasi lauk dan sayur dengan tambahan biaya belanja terkecil, menghindari bahan yang akan layu, dengan batas pengulangan agar tetap bervariasi
- Daftar belanja tersusun per kelompok, dibulatkan ke kemasan utuh; bahan dapur yang biasanya tersedia dipisahkan
- **Sisa kemasan** bahan awet (bawang, telur, kentang, beras) terbawa ke minggu berikutnya dan mengurangi daftar belanja; dapat dikoreksi manual
- **Kesegaran bahan**: daya tahan per bahan sesuai ketersediaan kulkas, peringatan bahan yang mungkin layu, dan pilihan belanja dua kali (Senin & Kamis)
- **Salin daftar belanja** untuk dipakai di Astro atau GoMart; ketuk nama bahan untuk menyalin kata kunci pencariannya
- Daftar harga pribadi yang dapat diperbarui, dengan tambahan persen yang dapat diatur untuk belanja lewat aplikasi selama harga belum diperbarui
- Perbandingan total belanja dengan amplop **Dapur & makan** dari [Amplop Gajian](https://eazythecreator.github.io/amplop-gajian/), atau dengan anggaran manual
- **Catat ke Amplop Gajian**: membuka Amplop Gajian dengan nominal dan keterangan sudah terisi, lalu menampilkan status sudah dicatat
- **Kadar gizi** per porsi (energi, protein, lemak, karbohidrat) dan perkiraan total per hari per orang, termasuk nasi
- **Cara memasak** setiap resep dengan takaran dapur (siung, sdt, sdm) sesuai porsi, termasuk tampilan masak per hari
- Resep sendiri (dengan langkah memasak) dan bahan sendiri
- Data hanya tersimpan di perangkat pengguna; cadangan dan pemulihan; dapat dipasang di layar utama dan dibuka tanpa internet

Buka aplikasinya di: https://eazythecreator.github.io/menu-kost/

## Harga awal

Harga awal dibulatkan dari harga pasar tradisional akhir Oktober 2026 (SP2KP Kementerian Perdagangan untuk DKI Jakarta dan PIHPS Bank Indonesia), lalu disesuaikan dengan ukuran kemasan yang lazim. Harga di aplikasi belanja umumnya lebih tinggi, sehingga pengguna diharapkan memperbaruinya setelah berbelanja.

## Keterhubungan dengan Amplop Gajian

Kedua aplikasi berada di origin yang sama (`eazythecreator.github.io`). Amplop Gajian menulis ringkasan amplop dapur bulan berjalan ke kunci `amplop-gajian-dapur` di penyimpanan lokal, dan aplikasi ini membacanya. Untuk mencatat belanja, aplikasi ini membuka `../amplop-gajian/#catat?jumlah=…&ket=…&ref=…`; Amplop Gajian mengisi formulirnya, menunggu pengguna menekan *Catat pengeluaran*, lalu menulis konfirmasi ke kunci `menu-kost-dicatat`. Tidak ada data yang dikirim ke server. Di iPhone, aplikasi yang dipasang ke layar utama memiliki penyimpanan masing-masing, sehingga keterhubungan hanya berlaku bila keduanya dibuka di Safari.

## Struktur

| File | Isi |
|---|---|
| `index.html` | Kerangka halaman |
| `styles.css` | Tampilan (mode terang dan gelap), sama dengan Amplop Gajian |
| `data.js` | Katalog bahan, harga awal, dan resep bawaan |
| `app.js` | Seluruh logika aplikasi |
| `sw.js`, `manifest.webmanifest` | Pemasangan dan penggunaan tanpa internet |
| `tests/test_app.py` | Tes otomatis perhitungan utama |
| `tests/test_perangkat.py` | Emulasi ponsel, kelayakan pemasangan, dan mode luring |
| `tests/test_integrasi.py` | Alur bersama Amplop Gajian (perlu folder `amplop-gajian` di sebelahnya) |

## Menjalankan tes

```bash
pip install playwright
python -m playwright install chromium
python tests/test_app.py
python tests/test_perangkat.py
python tests/test_integrasi.py
```
