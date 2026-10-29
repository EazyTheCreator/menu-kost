/* Data bawaan Menu Masak Mingguan.
 *
 * HARGA AWAL hanyalah titik mulai. Angka dibulatkan dari harga pasar tradisional
 * akhir Oktober 2026 (SP2KP Kemendag untuk DKI Jakarta dan PIHPS Bank Indonesia),
 * lalu dikonversi ke kemasan yang lazim dibeli. Harga di Astro atau GoMart umumnya
 * lebih tinggi; pengguna memperbarui harga pribadinya sendiri di aplikasi.
 *
 * Bahan: id -> { n: nama, k: kategori, s: satuan dasar, isi: jumlah per kemasan,
 *               lbl: label kemasan, h: harga per kemasan, stok: biasanya tersedia di dapur,
 *               q: kata kunci pencarian di aplikasi belanja }
 * Resep: jumlah bahan untuk SATU porsi, dalam satuan dasar bahan.
 */
window.MENU_DATA = (function(){
  const KAT = [
    { id:'sayur', n:'Sayur, buah & bumbu segar' },
    { id:'lauk',  n:'Lauk & protein' },
    { id:'pokok', n:'Bahan pokok & kemasan' },
    { id:'bumbu', n:'Bumbu kering & saus' },
    { id:'lain',  n:'Lainnya' }
  ];
  const b = (n, k, s, isi, lbl, h, stok, q) => ({ n, k, s, isi, lbl, h, stok: !!stok, q: q || n.toLowerCase() });
  const BAHAN = {
    // Sayur, buah & bumbu segar
    bawang_merah: b('Bawang merah', 'sayur', 'g', 250, '250 g', 10000, false),
    bawang_putih: b('Bawang putih', 'sayur', 'g', 250, '250 g', 10000, false),
    bombay:       b('Bawang bombay', 'sayur', 'g', 250, '250 g', 8000, false),
    cabai_merah:  b('Cabai merah keriting', 'sayur', 'g', 100, '100 g', 8000, false, 'cabai merah keriting'),
    cabai_rawit:  b('Cabai rawit merah', 'sayur', 'g', 100, '100 g', 10000, false, 'cabai rawit'),
    tomat:        b('Tomat', 'sayur', 'g', 500, '500 g', 8000, false),
    daun_bawang:  b('Daun bawang', 'sayur', 'batang', 5, '1 ikat (±5 batang)', 3000, false),
    rempah:       b('Bumbu dapur ikat (lengkuas, serai, daun salam)', 'sayur', 'ikat', 1, '1 ikat', 4000, false, 'bumbu dapur lengkuas serai'),
    kunyit:       b('Kunyit', 'sayur', 'g', 100, '100 g', 3000, false),
    jahe:         b('Jahe', 'sayur', 'g', 100, '100 g', 3500, false),
    jeruk_nipis:  b('Jeruk nipis', 'sayur', 'buah', 5, '±5 buah', 5000, false),
    bayam:        b('Bayam', 'sayur', 'ikat', 1, '1 ikat', 4000, false),
    kangkung:     b('Kangkung', 'sayur', 'ikat', 1, '1 ikat', 4000, false),
    sawi:         b('Sawi hijau (caisim)', 'sayur', 'g', 250, '250 g', 5000, false, 'sawi hijau'),
    kol:          b('Kol (kubis)', 'sayur', 'g', 500, '500 g', 5000, false, 'kol'),
    wortel:       b('Wortel', 'sayur', 'g', 500, '500 g', 8000, false),
    buncis:       b('Buncis', 'sayur', 'g', 250, '250 g', 5000, false),
    kentang:      b('Kentang', 'sayur', 'g', 500, '500 g', 9000, false),
    labu_siam:    b('Labu siam', 'sayur', 'buah', 1, '1 buah', 3000, false),
    jagung:       b('Jagung manis', 'sayur', 'buah', 1, '1 buah', 5000, false),
    toge:         b('Tauge', 'sayur', 'g', 250, '250 g', 4000, false, 'tauge'),
    terong:       b('Terong ungu', 'sayur', 'g', 500, '500 g', 6000, false, 'terong'),
    timun:        b('Timun', 'sayur', 'g', 500, '500 g', 6000, false),
    sayur_sop:    b('Sayur sop (paket)', 'sayur', 'paket', 1, '1 paket', 6000, false, 'sayur sop'),
    // Lauk & protein
    telur:        b('Telur ayam', 'lauk', 'butir', 10, '10 butir', 19000, false),
    ayam:         b('Ayam potong', 'lauk', 'g', 500, '500 g', 21000, false, 'ayam potong'),
    dada_ayam:    b('Dada ayam fillet', 'lauk', 'g', 500, '500 g', 30000, false, 'dada ayam fillet'),
    tempe:        b('Tempe', 'lauk', 'g', 300, '1 papan (±300 g)', 6000, false),
    tahu:         b('Tahu putih', 'lauk', 'buah', 10, '10 buah', 9000, false, 'tahu putih'),
    kembung:      b('Ikan kembung', 'lauk', 'g', 500, '500 g', 25000, false, 'ikan kembung'),
    lele:         b('Ikan lele', 'lauk', 'g', 500, '500 g', 15000, false, 'lele'),
    sarden:       b('Sarden kaleng', 'lauk', 'kaleng', 1, '1 kaleng 155 g', 11000, false, 'sarden'),
    nugget:       b('Nugget ayam', 'lauk', 'g', 500, '500 g', 30000, false, 'nugget ayam'),
    // Bahan pokok & kemasan
    beras:        b('Beras', 'pokok', 'g', 5000, '5 kg', 80000, true),
    minyak:       b('Minyak goreng', 'pokok', 'ml', 1000, '1 liter', 20000, true),
    mi_instan:    b('Mi instan', 'pokok', 'bungkus', 5, '5 bungkus', 17500, false),
    mi_telur:     b('Mi telur kering', 'pokok', 'g', 200, '200 g', 8000, false),
    roti:         b('Roti tawar', 'pokok', 'lembar', 12, '1 bungkus (±12 lembar)', 16000, false),
    santan:       b('Santan kemasan', 'pokok', 'ml', 65, '1 kotak 65 ml', 3500, false, 'santan'),
    terigu:       b('Tepung terigu', 'pokok', 'g', 1000, '1 kg', 13000, true),
    // Bumbu kering & saus
    garam:        b('Garam', 'bumbu', 'g', 250, '250 g', 4000, true),
    gula:         b('Gula pasir', 'bumbu', 'g', 1000, '1 kg', 19000, true),
    merica:       b('Merica bubuk', 'bumbu', 'g', 25, '25 g', 6000, true),
    kaldu:        b('Kaldu bubuk', 'bumbu', 'g', 100, '100 g', 7500, true),
    kecap:        b('Kecap manis', 'bumbu', 'ml', 220, '220 ml', 10000, true),
    saus_tiram:   b('Saus tiram', 'bumbu', 'ml', 133, '133 ml', 10000, true)
  };

  // Daya tahan perkiraan dalam hari: [tanpa kulkas, dengan kulkas]. beku: bisa disimpan lama di freezer.
  // Angka ini sengaja konservatif dan hanya dipakai untuk peringatan layu serta perhitungan sisa kemasan.
  const TAHAN = {
    bawang_merah:[30,30], bawang_putih:[60,60], bombay:[30,30], cabai_merah:[4,10], cabai_rawit:[4,10],
    tomat:[5,10], daun_bawang:[3,7], rempah:[5,14], kunyit:[21,30], jahe:[21,30], jeruk_nipis:[10,21],
    bayam:[1,3], kangkung:[1,3], sawi:[2,4], kol:[5,14], wortel:[7,21], buncis:[3,7], kentang:[30,30],
    labu_siam:[14,21], jagung:[3,5], toge:[1,2], terong:[4,7], timun:[5,7], sayur_sop:[2,4],
    telur:[14,28], ayam:[1,3], dada_ayam:[1,3], tempe:[2,4], tahu:[1,3], kembung:[1,2], lele:[1,2],
    sarden:[365,365], nugget:[1,3], beras:[180,180], minyak:[180,180], mi_instan:[180,180], mi_telur:[180,180],
    roti:[4,7], santan:[180,180], terigu:[180,180], garam:[365,365], gula:[365,365], merica:[365,365],
    kaldu:[365,365], kecap:[365,365], saus_tiram:[180,180]
  };
  const BEKU = ['ayam', 'dada_ayam', 'kembung', 'lele', 'nugget'];
  // utuh: kemasan yang sudah dibuka tidak awet, sehingga hanya kemasan utuh yang dihitung sebagai sisa.
  const UTUH = ['sarden', 'santan'];
  Object.keys(BAHAN).forEach(id => { BAHAN[id].tahan = TAHAN[id] || [7, 14]; BAHAN[id].beku = BEKU.includes(id); BAHAN[id].utuh = UTUH.includes(id); });

  // jenis: lauk | sayur | sekali (sudah mengandung karbohidrat, tidak ditambah nasi otomatis)
  const r = (id, n, jenis, menit, bahan, catatan) => ({ id, n, jenis, menit, bahan, catatan: catatan || '' });
  const RESEP = [
    // Lauk
    r('telur_dadar', 'Telur dadar daun bawang', 'lauk', 10,
      [['telur',2],['bawang_merah',10],['daun_bawang',0.5],['cabai_rawit',5],['minyak',15],['garam',1]]),
    r('telur_balado', 'Telur balado', 'lauk', 25,
      [['telur',2],['cabai_merah',25],['bawang_merah',15],['bawang_putih',5],['tomat',30],['minyak',25],['gula',3],['garam',1]]),
    r('tempe_orek', 'Tempe orek kecap', 'lauk', 20,
      [['tempe',100],['kecap',15],['bawang_merah',10],['bawang_putih',5],['cabai_merah',10],['rempah',0.2],['minyak',20],['gula',3],['garam',1]]),
    r('tahu_tempe_sambal', 'Tahu tempe goreng + sambal tomat', 'lauk', 20,
      [['tahu',2],['tempe',75],['bawang_putih',5],['kunyit',3],['minyak',40],['garam',2],['cabai_rawit',10],['tomat',30],['bawang_merah',10]]),
    r('ayam_goreng_kuning', 'Ayam goreng bumbu kuning', 'lauk', 45,
      [['ayam',150],['bawang_putih',8],['bawang_merah',10],['kunyit',5],['rempah',0.25],['minyak',50],['garam',2]],
      'Ungkep sekaligus untuk beberapa porsi agar hemat gas.'),
    r('ayam_kecap', 'Ayam kecap', 'lauk', 35,
      [['ayam',150],['kecap',20],['bombay',30],['bawang_putih',8],['tomat',30],['minyak',15],['garam',1],['merica',0.5]]),
    r('ayam_suwir', 'Ayam suwir pedas', 'lauk', 35,
      [['dada_ayam',120],['cabai_merah',20],['cabai_rawit',5],['bawang_merah',12],['bawang_putih',6],['tomat',25],['rempah',0.2],['minyak',15],['gula',2],['garam',1]]),
    r('soto_ayam', 'Soto ayam bening', 'lauk', 50,
      [['ayam',100],['kol',30],['toge',30],['kunyit',4],['jahe',3],['bawang_putih',6],['bawang_merah',8],['rempah',0.25],['daun_bawang',0.5],['jeruk_nipis',0.25],['minyak',10],['garam',2],['kaldu',2]]),
    r('sup_ayam', 'Sup ayam kentang wortel', 'lauk', 40,
      [['ayam',100],['kentang',80],['wortel',50],['bawang_putih',5],['daun_bawang',0.5],['merica',0.5],['garam',1.5],['kaldu',2]]),
    r('kembung_goreng', 'Ikan kembung goreng + sambal tomat', 'lauk', 30,
      [['kembung',150],['jeruk_nipis',0.5],['bawang_putih',5],['kunyit',3],['minyak',50],['garam',2],['cabai_rawit',10],['tomat',50],['bawang_merah',10]]),
    r('pecel_lele', 'Pecel lele + lalapan', 'lauk', 35,
      [['lele',200],['jeruk_nipis',0.5],['bawang_putih',5],['kunyit',3],['minyak',60],['garam',2],['cabai_rawit',10],['cabai_merah',10],['tomat',40],['bawang_merah',10],['timun',50],['kol',30]]),
    r('sarden_tomat', 'Sarden tumis bawang bombay', 'lauk', 15,
      [['sarden',0.5],['bombay',20],['cabai_rawit',5],['bawang_putih',5],['minyak',10]]),
    r('nugget', 'Nugget ayam goreng', 'lauk', 10,
      [['nugget',100],['minyak',30]]),
    r('perkedel', 'Perkedel kentang', 'lauk', 40,
      [['kentang',150],['telur',0.5],['bawang_merah',8],['bawang_putih',4],['daun_bawang',0.5],['minyak',30],['garam',1],['merica',0.5]]),
    r('kentang_balado', 'Kentang balado', 'lauk', 30,
      [['kentang',120],['cabai_merah',20],['bawang_merah',10],['bawang_putih',4],['minyak',40],['gula',2],['garam',1]]),
    // Sayur
    r('bening_bayam', 'Sayur bening bayam jagung', 'sayur', 15,
      [['bayam',0.5],['jagung',0.5],['bawang_merah',5],['bawang_putih',3],['garam',1],['gula',1]]),
    r('tumis_kangkung', 'Tumis kangkung', 'sayur', 10,
      [['kangkung',0.5],['bawang_merah',8],['bawang_putih',5],['cabai_rawit',5],['saus_tiram',10],['minyak',10]]),
    r('sayur_sop', 'Sayur sop', 'sayur', 25,
      [['sayur_sop',0.5],['bawang_putih',5],['bawang_merah',5],['daun_bawang',0.5],['garam',1],['merica',0.5],['kaldu',2]]),
    r('capcay', 'Capcay kuah sederhana', 'sayur', 20,
      [['kol',60],['wortel',40],['sawi',50],['bawang_putih',6],['bombay',20],['saus_tiram',10],['terigu',5],['minyak',10],['garam',1]]),
    r('tumis_buncis', 'Tumis buncis wortel', 'sayur', 15,
      [['buncis',70],['wortel',40],['bawang_putih',5],['bawang_merah',5],['saus_tiram',8],['minyak',10]]),
    r('tumis_toge', 'Tumis tauge', 'sayur', 10,
      [['toge',100],['daun_bawang',0.5],['bawang_putih',5],['cabai_rawit',3],['minyak',10],['garam',1]]),
    r('lodeh', 'Sayur lodeh labu siam', 'sayur', 30,
      [['labu_siam',0.5],['terong',50],['santan',32],['bawang_merah',8],['bawang_putih',5],['rempah',0.2],['cabai_merah',5],['garam',1],['gula',2]]),
    r('terong_balado', 'Terong balado', 'sayur', 25,
      [['terong',120],['cabai_merah',25],['bawang_merah',12],['bawang_putih',5],['tomat',25],['minyak',30],['gula',2],['garam',1]]),
    r('lalapan', 'Lalapan timun & kol', 'sayur', 5,
      [['timun',80],['kol',40]]),
    // Sekali makan (sudah termasuk karbohidrat)
    r('nasgor_telur', 'Nasi goreng telur', 'sekali', 15,
      [['beras',120],['telur',1],['bawang_merah',10],['bawang_putih',5],['cabai_rawit',5],['kecap',15],['minyak',15],['garam',1],['daun_bawang',0.5]],
      'Paling enak memakai nasi sisa kemarin.'),
    r('mi_goreng_telur', 'Mi instan goreng + telur & sawi', 'sekali', 10,
      [['mi_instan',1],['telur',1],['sawi',40],['cabai_rawit',3]]),
    r('mi_rebus', 'Mi instan rebus telur & sayur', 'sekali', 10,
      [['mi_instan',1],['telur',1],['sawi',40],['tomat',20],['daun_bawang',0.5]]),
    r('mi_jawa', 'Mi goreng jawa', 'sekali', 20,
      [['mi_telur',70],['telur',1],['kol',40],['sawi',30],['wortel',20],['bawang_merah',8],['bawang_putih',5],['kecap',15],['saus_tiram',5],['minyak',15],['garam',1],['merica',0.5]]),
    r('roti_telur', 'Roti telur', 'sekali', 10,
      [['roti',2],['telur',1],['minyak',5]])
  ];

  // Cara memasak singkat. Takaran mengikuti daftar bahan resep; garam dan gula disesuaikan selera.
  const LANGKAH = {
    telur_dadar: ['Iris tipis bawang merah, daun bawang, dan cabai rawit.', 'Kocok telur bersama irisan bumbu dan sejumput garam.', 'Panaskan minyak di wajan dengan api sedang.', 'Tuang telur, masak hingga bagian bawah kecokelatan, balik, lalu masak sebentar hingga matang.'],
    telur_balado: ['Rebus telur 10 menit, kupas, lalu goreng sebentar hingga kulitnya sedikit berkerut. Angkat.', 'Haluskan atau ulek kasar cabai merah, bawang merah, bawang putih, dan tomat.', 'Tumis bumbu dengan sisa minyak hingga harum dan minyaknya keluar, sekitar 7 menit.', 'Tambahkan garam dan gula, masukkan telur, aduk hingga terbalut bumbu.'],
    tempe_orek: ['Potong tempe seukuran korek api, goreng hingga kering, lalu angkat.', 'Iris bawang merah, bawang putih, dan cabai merah.', 'Tumis irisan bumbu bersama lengkuas dan daun salam hingga harum.', 'Masukkan tempe, kecap, gula, garam, dan 2 sdm air. Aduk di api kecil hingga kecap meresap dan agak kering.'],
    tahu_tempe_sambal: ['Potong tahu dan tempe. Rendam sebentar dalam air yang diberi bawang putih halus, kunyit, dan garam.', 'Goreng tahu dan tempe hingga kuning kecokelatan.', 'Untuk sambal, goreng sebentar cabai rawit, tomat, dan bawang merah, lalu ulek dengan sedikit garam.', 'Sajikan tahu dan tempe dengan sambal.'],
    ayam_goreng_kuning: ['Haluskan bawang putih, bawang merah, dan kunyit.', 'Masukkan ayam, bumbu halus, lengkuas, serai, daun salam, garam, dan air hingga ayam terendam.', 'Ungkep dengan api sedang 25–30 menit hingga air hampir habis.', 'Goreng ayam dalam minyak panas hingga kecokelatan.'],
    ayam_kecap: ['Goreng ayam setengah matang, lalu angkat.', 'Tumis bawang putih cincang dan bawang bombay iris hingga layu.', 'Masukkan ayam, tomat, kecap, merica, garam, dan 100 ml air.', 'Masak dengan api kecil 15 menit hingga kuah mengental.'],
    ayam_suwir: ['Rebus dada ayam bersama sedikit garam sekitar 20 menit, tiriskan, lalu suwir.', 'Haluskan cabai merah, cabai rawit, bawang merah, bawang putih, dan tomat.', 'Tumis bumbu bersama lengkuas dan daun salam hingga matang dan harum.', 'Masukkan ayam suwir, gula, dan garam. Aduk hingga bumbu meresap.'],
    soto_ayam: ['Rebus ayam dalam 500 ml air per porsi hingga matang, angkat, lalu suwir. Simpan kaldunya.', 'Haluskan bawang merah, bawang putih, kunyit, dan jahe, lalu tumis bersama serai dan daun salam hingga harum.', 'Masukkan tumisan bumbu ke kaldu, tambahkan garam dan kaldu bubuk, lalu didihkan 10 menit.', 'Seduh kol iris dan tauge dengan air panas.', 'Sajikan ayam suwir, kol, dan tauge disiram kuah, beri daun bawang dan perasan jeruk nipis.'],
    sup_ayam: ['Rebus ayam dalam 400 ml air per porsi hingga matang, buang buihnya.', 'Masukkan kentang dan wortel yang sudah dipotong dadu, masak hingga empuk.', 'Tumis bawang putih geprek sebentar, lalu masukkan ke sup.', 'Bumbui dengan garam, merica, dan kaldu bubuk. Taburi daun bawang.'],
    kembung_goreng: ['Bersihkan ikan, kerat kedua sisinya, lalu lumuri perasan jeruk nipis dan diamkan 10 menit.', 'Lumuri ikan dengan bawang putih halus, kunyit, dan garam, diamkan 10 menit.', 'Goreng dalam minyak panas hingga kering. Jangan sering dibalik.', 'Untuk sambal, goreng cabai rawit, tomat, dan bawang merah, lalu ulek dengan garam.'],
    pecel_lele: ['Bersihkan lele, lumuri jeruk nipis, lalu bilas.', 'Lumuri lele dengan bawang putih halus, kunyit, dan garam, diamkan 15 menit.', 'Goreng lele dalam minyak banyak hingga kering.', 'Goreng sebentar cabai, tomat, dan bawang merah, lalu ulek menjadi sambal dengan garam.', 'Sajikan dengan irisan timun dan kol.'],
    sarden_tomat: ['Iris bawang bombay, cincang bawang putih, dan iris cabai rawit.', 'Tumis bumbu hingga harum dan bawang bombay layu.', 'Masukkan sarden beserta sausnya, tambah sedikit air bila terlalu kental.', 'Masak 5 menit hingga mendidih.'],
    nugget: ['Panaskan minyak dengan api sedang.', 'Goreng nugget beku langsung tanpa dicairkan, 3–4 menit hingga kuning keemasan.', 'Tiriskan di atas tisu dapur.'],
    perkedel: ['Kupas kentang, potong, lalu goreng atau rebus hingga empuk.', 'Haluskan kentang selagi panas.', 'Campur dengan bawang merah dan bawang putih goreng yang dihaluskan, daun bawang, garam, dan merica.', 'Bentuk bulat pipih, celupkan ke telur kocok, lalu goreng hingga kecokelatan.'],
    kentang_balado: ['Potong dadu kentang, goreng hingga matang dan kering di luar.', 'Haluskan cabai merah, bawang merah, dan bawang putih.', 'Tumis bumbu dengan sedikit minyak hingga matang.', 'Masukkan kentang, gula, dan garam, aduk rata.'],
    bening_bayam: ['Didihkan 300 ml air per porsi bersama irisan bawang merah dan bawang putih.', 'Masukkan jagung yang sudah dipipil atau dipotong, masak 5 menit.', 'Masukkan bayam, garam, dan gula.', 'Matikan api begitu bayam layu agar tetap hijau.'],
    tumis_kangkung: ['Siangi kangkung lalu cuci bersih.', 'Tumis irisan bawang merah, bawang putih, dan cabai rawit hingga harum.', 'Masukkan kangkung dan saus tiram, besarkan api.', 'Aduk cepat 1–2 menit hingga kangkung layu, lalu angkat.'],
    sayur_sop: ['Potong-potong sayuran sop.', 'Didihkan 400 ml air per porsi, masukkan wortel dan kentang lebih dulu.', 'Tumis bawang putih dan bawang merah sebentar, lalu masukkan ke kuah.', 'Masukkan kol dan buncis, bumbui dengan garam, merica, dan kaldu bubuk. Masak hingga sayur empuk, lalu taburi daun bawang.'],
    capcay: ['Potong kol, wortel, dan sawi.', 'Tumis bawang putih dan bawang bombay hingga harum.', 'Masukkan wortel, lalu kol dan sawi, beri 150 ml air per porsi dan saus tiram.', 'Kentalkan dengan tepung yang dilarutkan dalam sedikit air, lalu beri garam.'],
    tumis_buncis: ['Potong serong buncis dan wortel.', 'Tumis bawang merah dan bawang putih hingga harum.', 'Masukkan wortel, lalu buncis, beri 3 sdm air.', 'Tambahkan saus tiram dan masak hingga sayur matang namun tetap renyah.'],
    tumis_toge: ['Buang akar tauge bila sempat, lalu cuci.', 'Tumis bawang putih dan cabai rawit hingga harum.', 'Masukkan tauge dan daun bawang dengan api besar, beri garam.', 'Aduk sebentar saja, sekitar 1 menit, agar tauge tetap renyah.'],
    lodeh: ['Potong labu siam dan terong.', 'Tumis bawang merah, bawang putih, dan cabai bersama lengkuas dan daun salam hingga harum.', 'Tambahkan 250 ml air per porsi, didihkan, lalu masukkan labu siam.', 'Setelah labu hampir empuk, masukkan terong dan santan. Aduk terus agar santan tidak pecah, lalu beri garam dan gula.'],
    terong_balado: ['Potong terong, goreng sebentar hingga layu, lalu angkat.', 'Haluskan cabai merah, bawang merah, bawang putih, dan tomat.', 'Tumis bumbu hingga matang dan berminyak.', 'Masukkan terong, gula, dan garam, aduk hingga terbalut bumbu.'],
    lalapan: ['Cuci timun dan kol dengan air mengalir.', 'Potong timun dan kol, lalu sajikan segar sebagai pendamping lauk dan sambal.'],
    nasgor_telur: ['Ulek bawang merah, bawang putih, cabai rawit, dan garam.', 'Orak-arik telur dengan sedikit minyak, sisihkan ke pinggir wajan.', 'Tumis bumbu hingga harum, lalu masukkan nasi.', 'Tambahkan kecap, aduk dengan api besar hingga rata, lalu taburi daun bawang.'],
    mi_goreng_telur: ['Rebus mi bersama sawi hingga matang, lalu tiriskan.', 'Ceplok telur atau orak-arik dengan sedikit minyak.', 'Campur mi dengan bumbu bawaan dan irisan cabai rawit.', 'Sajikan dengan telur dan sawi.'],
    mi_rebus: ['Didihkan air sesuai petunjuk kemasan.', 'Masukkan mi, tomat, dan sawi.', 'Pecahkan telur ke dalam kuah, jangan diaduk dulu agar telur utuh.', 'Masukkan bumbu, taburi daun bawang.'],
    mi_jawa: ['Rebus mi telur hingga lunak, tiriskan.', 'Tumis bawang merah dan bawang putih, lalu orak-arik telur di wajan yang sama.', 'Masukkan wortel, kol, dan sawi, beri 3 sdm air.', 'Masukkan mi, kecap, saus tiram, garam, dan merica. Aduk dengan api besar hingga rata.'],
    roti_telur: ['Kocok telur dengan sejumput garam.', 'Celupkan roti ke kocokan telur.', 'Panggang di wajan berminyak tipis hingga kedua sisi kecokelatan.']
  };
  RESEP.forEach(r => { r.langkah = LANGKAH[r.id] || []; });
  // Takaran dapur untuk menampilkan resep: berat per satuan rumah tangga.
  const TAKARAN = {
    bawang_merah:[5,'siung'], bawang_putih:[4,'siung'], cabai_rawit:[1.5,'buah'], cabai_merah:[5,'buah'],
    tomat:[100,'buah'], kentang:[150,'buah'], wortel:[100,'buah'], bombay:[150,'buah'], kunyit:[5,'ruas'], jahe:[5,'ruas'],
    garam:[5,'sdt'], gula:[4,'sdt'], merica:[2.5,'sdt'], kaldu:[3,'sdt']
  };

  // Menu hemat untuk isi otomatis: pasangan lauk + sayur yang masuk akal.
  const HEMAT = {
    lauk: ['telur_dadar','telur_balado','tempe_orek','tahu_tempe_sambal','ayam_goreng_kuning','ayam_kecap','sup_ayam','kembung_goreng','pecel_lele','sarden_tomat','perkedel','ayam_suwir'],
    sayur: ['bening_bayam','tumis_kangkung','sayur_sop','tumis_buncis','tumis_toge','capcay','lodeh','terong_balado','lalapan'],
    sekali: ['nasgor_telur','mi_jawa','mi_rebus'],
    pagi: ['roti_telur','nasgor_telur']
  };

  return { KAT, BAHAN, RESEP, HEMAT, TAKARAN, SUMBER_HARGA: 'Harga pasar akhir Oktober 2026 (SP2KP Kemendag DKI Jakarta, PIHPS Bank Indonesia), dibulatkan' };
})();
