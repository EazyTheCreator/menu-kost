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

  // Menu hemat untuk isi otomatis: pasangan lauk + sayur yang masuk akal.
  const HEMAT = {
    lauk: ['telur_dadar','telur_balado','tempe_orek','tahu_tempe_sambal','ayam_goreng_kuning','ayam_kecap','sup_ayam','kembung_goreng','pecel_lele','sarden_tomat','perkedel','ayam_suwir'],
    sayur: ['bening_bayam','tumis_kangkung','sayur_sop','tumis_buncis','tumis_toge','capcay','lodeh','terong_balado','lalapan'],
    sekali: ['nasgor_telur','mi_jawa','mi_rebus'],
    pagi: ['roti_telur','nasgor_telur']
  };

  return { KAT, BAHAN, RESEP, HEMAT, SUMBER_HARGA: 'Harga pasar akhir Oktober 2026 (SP2KP Kemendag DKI Jakarta, PIHPS Bank Indonesia), dibulatkan' };
})();
