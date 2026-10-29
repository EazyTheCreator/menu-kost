(function(){
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const NF = new Intl.NumberFormat('id-ID');
  const fmt = (n) => NF.format(Math.round(Math.abs(n)));
  const rp = (n) => (n < 0 ? '−' : '') + 'Rp' + fmt(n);
  const rpE = (n) => rp(Math.round(n / 100) * 100);   // perkiraan dibulatkan ke ratusan
  const digits = (s) => { const d = String(s).replace(/\D/g, '').slice(0, 12); return d ? parseInt(d, 10) : 0; };
  const dec = (s) => { const v = parseFloat(String(s).replace(/\./g, '').replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const D = window.MENU_DATA;
  const LS_KEY = 'menu-kost-v1';
  const META_KEY = 'menu-kost-meta';
  const AMPLOP_KEY = 'amplop-gajian-dapur';   // ringkasan yang ditulis aplikasi Amplop Gajian (origin yang sama)
  const DAY = 86400000;
  const WAKTU = [
    { id:'pagi',  n:'Sarapan', tone:'var(--c5)', ico:'sunrise' },
    { id:'siang', n:'Siang',   tone:'var(--c9)', ico:'sun' },
    { id:'malam', n:'Malam',   tone:'var(--c10)', ico:'moon' }
  ];
  const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const JENIS = { lauk:'Lauk', sayur:'Sayur', sekali:'Sekali makan' };
  const JENIS_TONE = { lauk:'var(--c3)', sayur:'var(--c4)', sekali:'var(--c5)' };
  const SATUAN = ['g', 'ml', 'butir', 'buah', 'ikat', 'batang', 'bungkus', 'lembar', 'paket', 'kaleng', 'botol', 'sachet'];

  /* ---------- Ikon ---------- */
  const ICONS = {
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    sunrise:'<path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1"/><path d="m8 6 4-4 4 4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    pot:'<path d="M2.5 10h19"/><path d="M5 10v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7"/><path d="M9.5 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5"/>',
    leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    egg:'<path d="M12 22c-4 0-7-3-7-7.5C5 9 8.5 2 12 2s7 7 7 12.5C19 19 16 22 12 22z"/>',
    bowl:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7.5c1.2-1.4 2.6-2 4-2s2.8.6 4 2"/>',
    utensils:'<path d="M7 2v20"/><path d="M4 2v6a3 3 0 0 0 6 0V2"/><path d="M18 22V2c-2.2 1-3.5 4-3.5 7.5S16 13 18 13"/>',
    repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'
  };
  const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[k] || '') + '</svg>';
  const CHECK = svg('check');
  $$('#waktuChips .ico').forEach((el, i) => { el.innerHTML = svg(WAKTU[i].ico); });
  $$('#pickOpts .ico').forEach((el, i) => { el.innerHTML = svg(i ? 'utensils' : 'repeat'); });

  /* ---------- Tanggal & minggu ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function weekLabel(k, withYear){
    const a = parseYmd(k), b = addDays(a, 6);
    const left = a.getMonth() === b.getMonth() ? String(a.getDate()) : a.getDate() + ' ' + BLN[a.getMonth()];
    return left + '–' + b.getDate() + ' ' + BLN[b.getMonth()] + (withYear ? ' ' + b.getFullYear() : '');
  }
  const thisWeek = () => ymd(mondayOf(new Date()));
  let wk = thisWeek();

  /* ---------- Penyimpanan ---------- */
  const defaults = () => ({
    v: 1,
    set: { porsi: 1, waktu: { pagi: false, siang: true, malam: true }, beras: 100, sumber: 'auto', manual: 0, hitung: {}, kulkas: 'tidak', toko: 'online', markup: 20 },
    harga: {},      // id bahan bawaan -> { h, isi, t, prev }
    bahan: {},      // bahan buatan sendiri: id -> { n, k, s, isi, lbl, h, stok, q, t, prev }
    resep: [],      // resep buatan sendiri
    minggu: {}      // 'YYYY-MM-DD' (Senin) -> { slot, stok, beli, extra }
  });
  function normState(o){
    const s = defaults();
    if (!o || typeof o !== 'object') return s;
    const set = o.set || {};
    s.set.porsi = Math.min(8, Math.max(1, parseInt(set.porsi, 10) || 1));
    if (set.waktu && typeof set.waktu === 'object') WAKTU.forEach(w => { if (w.id in set.waktu) s.set.waktu[w.id] = !!set.waktu[w.id]; });
    s.set.beras = Number.isFinite(Number(set.beras)) ? Math.max(0, Math.min(400, Number(set.beras))) : 100;
    s.set.sumber = set.sumber === 'manual' ? 'manual' : 'auto';
    s.set.manual = Math.max(0, Number(set.manual) || 0);
    s.set.hitung = (set.hitung && typeof set.hitung === 'object') ? set.hitung : {};
    s.set.kulkas = ['tidak', 'kulkas', 'freezer'].includes(set.kulkas) ? set.kulkas : 'tidak';
    s.set.toko = set.toko === 'pasar' ? 'pasar' : 'online';
    s.set.markup = Number.isFinite(Number(set.markup)) ? Math.max(0, Math.min(100, Math.round(Number(set.markup)))) : 20;
    s.harga = (o.harga && typeof o.harga === 'object') ? o.harga : {};
    s.bahan = (o.bahan && typeof o.bahan === 'object') ? o.bahan : {};
    s.resep = Array.isArray(o.resep) ? o.resep.filter(r => r && r.id && r.n && Array.isArray(r.bahan)) : [];
    s.minggu = {};
    Object.keys(o.minggu || {}).forEach(k => { if (/^\d{4}-\d{2}-\d{2}$/.test(k)) s.minggu[k] = normWeek(o.minggu[k]); });
    return s;
  }
  function normWeek(w){
    w = w || {};
    return {
      slot: (w.slot && typeof w.slot === 'object') ? w.slot : {},
      stok: (w.stok && typeof w.stok === 'object') ? w.stok : {},
      beli: (w.beli && typeof w.beli === 'object') ? w.beli : {},
      awal: (w.awal && typeof w.awal === 'object') ? w.awal : {},   // koreksi sisa di dapur pada awal minggu
      bayar: Math.max(0, Number(w.bayar) || 0),
      extra: Array.isArray(w.extra) ? w.extra.filter(x => x && x.n).map(x => ({ id: String(x.id || newId()), n: String(x.n), h: Math.max(0, Number(x.h) || 0) })) : []
    };
  }
  let S = defaults();
  try { const raw = localStorage.getItem(LS_KEY); if (raw) S = normState(JSON.parse(raw)); } catch (e) {}

  let saveT = 0;
  function save(){
    clearTimeout(saveT);
    saveT = setTimeout(writeNow, 250);
  }
  function writeNow(){
    clearTimeout(saveT);
    // Minggu kosong tidak perlu disimpan.
    Object.keys(S.minggu).forEach(k => { if (k !== wk && weekIsEmpty(S.minggu[k])) delete S.minggu[k]; });
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); setStatus('local'); if (hasData()) askPersist(); }
    catch (e) { setStatus('err'); }
  }
  window.addEventListener('pagehide', writeNow);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') writeNow(); });
  function setStatus(s){
    const el = $('#status');
    const text = { init:'Menyiapkan penyimpanan…', local:'Tersimpan otomatis di perangkat ini', err:'Gagal menyimpan. Penyimpanan peramban penuh atau diblokir; unduh cadangan sekarang.' };
    el.dataset.s = s; el.textContent = text[s] || '';
  }
  const weekIsEmpty = (w) => !w || (!Object.keys(w.slot).some(k => slotFilled(w.slot[k])) && !w.extra.length);
  const W = () => (S.minggu[wk] = S.minggu[wk] || normWeek(null));
  const peekWeek = (k) => S.minggu[k] || null;

  /* ---------- Bahan & resep ---------- */
  // Harga awal (bila belum diperbarui) disesuaikan dengan ukuran kemasan dan, untuk belanja di aplikasi,
  // ditambah persentase perkiraan. Harga yang sudah diperbarui pengguna dipakai apa adanya.
  const markupOn = () => S.set.toko === 'online' && S.set.markup > 0;
  const round100 = (n) => Math.round(n / 100) * 100;
  function awalPrice(base, isi){
    const h = base.h * isi / base.isi;
    return round100(markupOn() ? h * (1 + S.set.markup / 100) : h);
  }
  function bahan(id){
    const base = D.BAHAN[id];
    if (base) {
      const o = S.harga[id] || {};
      const isi = o.isi > 0 ? o.isi : base.isi;
      const own = o.h !== undefined && o.h >= 0;
      return Object.assign({ id, own:false }, base, {
        h: own ? o.h : awalPrice(base, isi), isi, ownPrice: own,
        lbl: o.isi > 0 && o.isi !== base.isi ? qtyLbl(isi, base.s) : base.lbl,
        t: o.t || 0, prev: o.prev, edited: !!(o.t)
      });
    }
    const c = S.bahan[id];
    if (c) return Object.assign({ id, own:true, edited: !!c.t }, c, { lbl: qtyLbl(c.isi, c.s) });
    return null;
  }
  // Daya tahan (hari) sesuai ketersediaan kulkas; bahan dianggap awet bila tahan lebih dari sepekan.
  function shelf(b){
    const t = Array.isArray(b.tahan) ? b.tahan : [7, 14];
    if (S.set.kulkas === 'freezer' && b.beku) return 60;
    return S.set.kulkas === 'tidak' ? t[0] : t[1];
  }
  const durable = (b) => shelf(b) >= 10;
  const bahanIds = () => Object.keys(D.BAHAN).concat(Object.keys(S.bahan));
  const resepAll = () => D.RESEP.map(r => Object.assign({ own:false }, r)).concat(S.resep.map(r => Object.assign({ own:true }, r)));
  const resepById = (id) => resepAll().find(r => r.id === id) || null;
  // Biaya satu porsi (proporsional terhadap harga kemasan), tanpa nasi.
  function resepCost(r){
    return r.bahan.reduce((s, [id, q]) => { const b = bahan(id); return b && b.isi ? s + q / b.isi * b.h : s; }, 0);
  }

  /* ---------- Format jumlah ---------- */
  const num1 = (v) => { const r = Math.round(v * 10) / 10; return String(r).replace('.', ','); };
  function qtyLbl(v, s){
    if (s === 'g') return v >= 1000 ? num1(v / 1000) + ' kg' : Math.round(v) + ' g';
    if (s === 'ml') return v >= 1000 ? num1(v / 1000) + ' liter' : Math.round(v) + ' ml';
    return num1(v) + ' ' + s;
  }
  function needLbl(v, s){
    if (s === 'g' || s === 'ml') { const step = v >= 100 ? 10 : 5; return qtyLbl(Math.max(step, Math.round(v / step) * step), s); }
    return qtyLbl(Math.round(v * 2) / 2 || 0.5, s);
  }

  /* ---------- Perhitungan kebutuhan ---------- */
  const activeWaktu = () => WAKTU.filter(w => S.set.waktu[w.id]);
  const slotKey = (d, w) => d + '-' + w;
  const slotFilled = (sl) => !!(sl && ((sl.r && sl.r.length) || sl.sisa || sl.luar));
  const needsRice = (ids) => { const rs = ids.map(resepById).filter(Boolean); return rs.length > 0 && !rs.some(r => r.jenis === 'sekali'); };

  // Menghitung porsi tiap resep dalam seminggu. Slot "sisa" menambah porsi masakan terakhir.
  function computeWeek(w){
    const porsi = S.set.porsi, count = {}, perDay = Array.from({ length: 7 }, () => ({}));
    let rice = 0, meals = 0, cooks = 0, last = null;
    const riceDay = Array(7).fill(0), orphan = [];
    for (let d = 0; d < 7; d++) {
      for (const wt of activeWaktu()) {
        const sl = w && w.slot[slotKey(d, wt.id)];
        if (!slotFilled(sl) || sl.luar) continue;
        if (sl.sisa) {
          if (!last) { orphan.push(slotKey(d, wt.id)); continue; }
          last.ids.forEach(id => { count[id] = (count[id] || 0) + porsi; perDay[last.d][id] = (perDay[last.d][id] || 0) + porsi; });
          if (last.rice) { rice += porsi * S.set.beras; riceDay[last.d] += porsi * S.set.beras; }
          meals++;
          continue;
        }
        const ids = (sl.r || []).filter(id => resepById(id));
        if (!ids.length) continue;
        ids.forEach(id => { count[id] = (count[id] || 0) + porsi; perDay[d][id] = (perDay[d][id] || 0) + porsi; });
        const nr = needsRice(ids);
        if (nr) { rice += porsi * S.set.beras; riceDay[d] += porsi * S.set.beras; }
        last = { ids, rice: nr, d };
        meals++; cooks++;
      }
    }
    return { count, rice, meals, cooks, perDay, riceDay, orphan };
  }
  function needsOf(count, rice){
    const need = {};
    Object.keys(count).forEach(id => {
      const r = resepById(id); if (!r) return;
      r.bahan.forEach(([bid, q]) => { if (bahan(bid)) need[bid] = (need[bid] || 0) + q * count[id]; });
    });
    if (rice > 0 && bahan('beras')) need.beras = (need.beras || 0) + rice;
    return need;
  }
  const usedValue = (need) => Object.keys(need).reduce((s, id) => { const b = bahan(id); return s + (b && b.isi ? need[id] / b.isi * b.h : 0); }, 0);
  // Daftar belanja: kebutuhan dibulatkan ke atas menjadi kemasan utuh (toleransi 4%).
  // Rencana belanja satu minggu. Sisa kemasan bahan awet dari minggu sebelumnya (berantai, maksimal
  // enam minggu ke belakang) mengurangi kebutuhan sebelum dibulatkan ke kemasan utuh.
  const TINY = 1e-6;
  function planWeek(k, depth, memo){
    if (memo.has(k)) return memo.get(k);
    const w = peekWeek(k);
    const cw = computeWeek(w), need = needsOf(cw.count, cw.rice);
    const carried = startStock(k, depth, memo);
    const start = Object.assign({}, carried);
    if (w) Object.keys(w.awal).forEach(id => { start[id] = Math.max(0, Number(w.awal[id]) || 0); });
    const leftover = {};
    const items = Object.keys(need).map(id => {
      const b = bahan(id);
      const stok = (w && id in w.stok) ? !!w.stok[id] : b.stok;
      const keep = !stok && durable(b);
      const have = keep ? (start[id] || 0) : 0;
      const net = Math.max(0, need[id] - have);
      const packs = net > TINY ? Math.max(1, Math.ceil(net / b.isi - 0.04)) : 0;
      if (keep) {
        // Bahan satuan (butir, kaleng, kotak) hanya dihitung utuh; kemasan kaleng atau kotak yang sudah dibuka tidak awet.
        let rest = have + packs * b.isi - need[id];
        if (b.s !== 'g' && b.s !== 'ml') rest = Math.floor(rest + 1e-9);
        if (b.utuh) rest = Math.floor(rest / b.isi + 1e-9) * b.isi;
        if (rest > b.isi * 0.02) leftover[id] = rest;
      }
      return { id, b, need: need[id], have, carried: carried[id] || 0, fixed: !!(w && id in w.awal), packs,
        cost: stok ? 0 : packs * b.h, used: need[id] / b.isi * b.h, stok, bought: !!(w && w.beli[id]) };
    });
    // Sisa bahan awet yang tidak dipakai minggu ini tetap tersimpan untuk minggu berikutnya.
    Object.keys(start).forEach(id => { const b = bahan(id); if (!(id in need) && b && durable(b) && start[id] > TINY) leftover[id] = start[id]; });
    const res = { w, cw, need, items, leftover };
    memo.set(k, res);
    return res;
  }
  function startStock(k, depth, memo){
    if (depth >= 6) return {};
    const prevK = ymd(addDays(parseYmd(k), -7));
    if (weekIsEmpty(peekWeek(prevK))) return {};
    return planWeek(prevK, depth + 1, memo).leftover;
  }
  function shopping(k){
    const p = planWeek(k || wk, 0, new Map());
    const order = D.KAT.map(x => x.id);
    const items = p.items.slice().sort((a, b) => (order.indexOf(a.b.k) - order.indexOf(b.b.k)) || a.b.n.localeCompare(b.b.n, 'id'));
    const extra = p.w ? p.w.extra : [];
    const buy = items.filter(x => !x.stok && x.packs > 0);
    const covered = items.filter(x => !x.stok && x.packs === 0);
    const pay = buy.reduce((s, x) => s + x.cost, 0) + extra.reduce((s, x) => s + x.h, 0);
    const used = items.reduce((s, x) => s + x.used, 0);
    return { cw: p.cw, items, buy, covered, stok: items.filter(x => x.stok), extra, pay, used, leftover: p.leftover };
  }

  /* ---------- Anggaran dari Amplop Gajian ---------- */
  function readAmplop(){
    try {
      const o = JSON.parse(localStorage.getItem(AMPLOP_KEY) || 'null');
      if (!o || o.v !== 1 || !/^\d{4}-\d{2}$/.test(o.bulan) || !Array.isArray(o.items)) return null;
      return o;
    } catch (e) { return null; }
  }
  const NOT_GROCERY = /luar|jajan|gas|lpg|elpiji|galon|resto|kafe|pesan/i;
  const counted = (name) => (name in S.set.hitung) ? !!S.set.hitung[name] : !NOT_GROCERY.test(name);
  const daysIn = (y, m) => new Date(y, m, 0).getDate();
  function budget(){
    const a = readAmplop();
    const wkDate = parseYmd(wk), wkMonth = wkDate.getFullYear() + '-' + pad(wkDate.getMonth() + 1);
    if (S.set.sumber === 'auto' && a && !a.belumIsi) {
      const items = a.items.map(x => ({ n: String(x.n), pagu: Math.max(0, Number(x.pagu) || 0), terpakai: Math.max(0, Number(x.terpakai) || 0), on: counted(String(x.n)) }));
      const on = items.filter(x => x.on);
      const pagu = on.reduce((s, x) => s + x.pagu, 0);
      const terpakai = on.reduce((s, x) => s + x.terpakai, 0) + Math.max(0, Number(a.lain) || 0);
      const [y, m] = a.bulan.split('-').map(Number);
      return { src: 'auto', a, items, pagu, terpakai, sisa: pagu - terpakai, bulan: a.bulan, beda: a.bulan !== wkMonth,
        jatah: Math.round(pagu * 7 / daysIn(y, m)) };
    }
    if (S.set.manual > 0) {
      return { src: 'manual', a, pagu: S.set.manual, jatah: Math.round(S.set.manual * 7 / daysIn(wkDate.getFullYear(), wkDate.getMonth() + 1)) };
    }
    return { src: 'none', a };
  }

  /* ---------- Animasi ---------- */
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function flow(el){
    if (!el || reduceMotion()) return;
    clearTimeout(el._flowT);
    el.classList.remove('flow');
    [...el.children].forEach((c, i) => c.style.setProperty('--i', String(Math.min(i, 12))));
    void el.offsetWidth;
    el.classList.add('flow');
    el._flowT = setTimeout(() => el.classList.remove('flow'), 1400);
  }
  let shown = null, raf = 0;
  function animateTotal(target){
    const el = $('#sTotal');
    if (shown === null || reduceMotion()) { shown = target; el.textContent = rp(target); return; }
    const from = shown, t0 = performance.now(), dur = 500;
    cancelAnimationFrame(raf);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (target - from) * e);
      el.textContent = rp(shown);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  let toastT = 0;
  function toast(msg){
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- Ringkasan atas ---------- */
  function renderSummary(sh){
    sh = sh || shopping();
    const isNow = wk === thisWeek(), isNext = wk === ymd(addDays(parseYmd(thisWeek()), 7));
    $('#heroLbl').textContent = isNow ? 'Perkiraan belanja minggu ini' : isNext ? 'Perkiraan belanja minggu depan' : 'Perkiraan belanja ' + weekLabel(wk);
    animateTotal(sh.pay);
    $('#sMeals').textContent = String(sh.cw.meals * S.set.porsi);
    $('#sItems').textContent = String(sh.buy.length + sh.extra.length);
    const bg = budget(), C = 2 * Math.PI * 48, fg = $('#ringFg');
    fg.style.strokeDasharray = String(C);
    if (bg.jatah > 0) {
      const ratio = sh.pay / bg.jatah;
      fg.style.strokeDashoffset = String(C * (1 - Math.min(1, ratio)));
      $('#ringPct').textContent = Math.round(ratio * 100) + '%';
      $('#ringSub').textContent = 'dari jatah';
      $('#ring').classList.toggle('over', ratio > 1);
      $('#ring').setAttribute('aria-label', Math.round(ratio * 100) + '% dari jatah belanja dapur per minggu');
    } else {
      fg.style.strokeDashoffset = String(C);
      $('#ringPct').textContent = '–'; $('#ringSub').textContent = 'atur anggaran';
      $('#ring').classList.remove('over');
      $('#ring').setAttribute('aria-label', 'Anggaran dapur belum diatur');
    }
    $('#wLabel').textContent = weekLabel(wk);
  }

  /* ---------- Tab Menu ---------- */
  function renderSetup(){
    $$('#waktuChips button').forEach(b => b.setAttribute('aria-pressed', String(!!S.set.waktu[b.dataset.w])));
    $('#porsiVal').textContent = String(S.set.porsi);
    $('#porsiMinus').disabled = S.set.porsi <= 1;
    $('#porsiPlus').disabled = S.set.porsi >= 8;
  }
  function sisaSource(d, wid){
    // Mencari slot masak terakhir sebelum slot ini (untuk label "Sisa …").
    const w = peekWeek(wk); if (!w) return null;
    const act = activeWaktu().map(x => x.id);
    for (let dd = d; dd >= 0; dd--) {
      const list = dd === d ? act.slice(0, act.indexOf(wid)) : act.slice();
      for (let i = list.length - 1; i >= 0; i--) {
        const sl = w.slot[slotKey(dd, list[i])];
        if (sl && !sl.sisa && !sl.luar && sl.r && sl.r.length) return { d: dd, w: list[i], ids: sl.r };
      }
    }
    return null;
  }
  const waktuName = (id) => (WAKTU.find(x => x.id === id) || {}).n || '';
  function sisaText(d, wid){
    const src = sisaSource(d, wid);
    if (!src) return null;
    return 'Sisa ' + (src.d === d ? waktuName(src.w).toLowerCase() : (src.d === d - 1 ? waktuName(src.w).toLowerCase() + ' kemarin' : HARI[src.d] + ' ' + waktuName(src.w).toLowerCase()));
  }
  function renderDays(animate){
    const list = $('#dayList'), w = peekWeek(wk), act = activeWaktu();
    const start = parseYmd(wk), today = ymd(new Date());
    const cw = computeWeek(w);
    let html = '';
    if (!act.length) {
      list.innerHTML = '<li class="note">Pilih minimal satu waktu makan di atas untuk mulai menyusun menu.</li>';
      return;
    }
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, d), isToday = ymd(date) === today;
      const need = needsOf(cw.perDay[d], cw.riceDay[d]), val = usedValue(need);
      html += '<li class="day' + (isToday ? ' today' : '') + '" data-d="' + d + '"><div class="day-head"><span><b>' + HARI[d] + '</b> <small>' + date.getDate() + ' ' + BLN[date.getMonth()] + '</small>' +
        (isToday ? '<span class="tag ok">Hari ini</span>' : '') + '</span>' + (val > 0 ? '<span class="day-cost">±' + rpE(val) + '</span>' : '') + '</div>';
      act.forEach(wt => {
        const sl = w && w.slot[slotKey(d, wt.id)];
        let body = '';
        if (sl && sl.luar) body = '<div class="dishes"><span class="dish" style="--tone:var(--c10)"><i></i><span>Makan di luar</span></span></div>';
        else if (sl && sl.sisa) {
          const t = sisaText(d, wt.id);
          body = '<div class="dishes"><span class="dish" style="--tone:var(--c6)"><i></i><span>' + esc(t || 'Sisa masakan') + '</span></span></div>' +
            (t ? '' : '<span class="slot-warn">Belum ada masakan sebelumnya di minggu ini, jadi slot ini tidak dihitung.</span>');
        } else if (sl && sl.r && sl.r.length) {
          body = '<div class="dishes">' + sl.r.map(id => { const r = resepById(id); return r ? '<span class="dish" style="--tone:' + JENIS_TONE[r.jenis] + '"><i></i><span>' + esc(r.n) + '</span></span>' : ''; }).join('') + '</div>';
        } else body = '<span class="slot-empty">+ Pilih menu</span>';
        html += '<button type="button" class="slot' + (slotFilled(sl) ? ' filled' : '') + '" data-d="' + d + '" data-w="' + wt.id + '" aria-label="' + HARI[d] + ' ' + wt.n + ': ubah menu">' +
          '<span class="ico sm" style="--tone:' + wt.tone + '">' + svg(wt.ico) + '</span><span class="slot-body"><span class="slot-lbl">' + wt.n + '</span>' + body + '</span></button>';
      });
      html += '</li>';
    }
    list.innerHTML = html;
    if (animate) flow(list);
  }
  $('#dayList').addEventListener('click', (e) => {
    const b = e.target.closest('.slot'); if (!b) return;
    openPicker(Number(b.dataset.d), b.dataset.w);
  });
  $('#waktuChips').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.set.waktu[b.dataset.w] = !S.set.waktu[b.dataset.w];
    save(); renderSetup(); renderDays(true); renderSummary();
  });
  function stepPorsi(dv){ S.set.porsi = Math.min(8, Math.max(1, S.set.porsi + dv)); save(); renderSetup(); renderDays(); renderSummary(); }
  $('#porsiMinus').addEventListener('click', () => stepPorsi(-1));
  $('#porsiPlus').addEventListener('click', () => stepPorsi(1));

  // Isi otomatis yang hemat: setiap slot memilih kombinasi menu dengan tambahan biaya belanja terkecil
  // (memakai ulang bahan yang sudah dibeli), dengan batas pengulangan agar menu tetap bervariasi.
  const packPay = (need) => Object.keys(need).reduce((s, id) => { const b = bahan(id); return (!b || b.stok || need[id] <= TINY) ? s : s + Math.max(1, Math.ceil(need[id] / b.isi - 0.04)) * b.h; }, 0);
  function chooseCheap(w, options, d, used, carried){
    const cw = computeWeek(w), base = needsOf(cw.count, cw.rice), porsi = S.set.porsi;
    Object.keys(carried || {}).forEach(id => { base[id] = (base[id] || 0) - carried[id]; });
    const basePay = packPay(base);
    const scored = options.map(ids => {
      if (ids.some(id => (used[id] || []).some(x => Math.abs(x - d) < 2) || (used[id] || []).length >= 2)) return null;
      const need = Object.assign({}, base);
      ids.forEach(id => { const r = resepById(id); if (r) r.bahan.forEach(([bid, q]) => { need[bid] = (need[bid] || 0) + q * porsi * 2; }); });
      return { ids, cost: packPay(need) - basePay };
    }).filter(Boolean);
    if (!scored.length) return options[Math.floor(Math.random() * options.length)];
    scored.sort((a, b) => a.cost - b.cost);
    const top = scored.filter(x => x.cost <= scored[0].cost + 3000).slice(0, 4);
    return top[Math.floor(Math.random() * top.length)].ids;
  }
  $('#autoFill').addEventListener('click', () => {
    const act = activeWaktu(), w = W(), msg = $('#menuMsg');
    msg.className = 'form-msg';
    if (!act.length) { msg.className = 'form-msg bad'; msg.textContent = 'Pilih minimal satu waktu makan lebih dulu.'; return; }
    const pairs = [];
    D.HEMAT.lauk.forEach(l => D.HEMAT.sayur.forEach(sy => pairs.push([l, sy])));
    const used = {};
    const mark = (ids, d) => ids.forEach(id => { (used[id] = used[id] || []).push(d); });
    for (let d = 0; d < 7; d++) act.forEach(wt => { const sl = w.slot[slotKey(d, wt.id)]; if (sl && sl.r) mark(sl.r, d); });
    const carried = startStock(wk, 0, new Map());
    let filled = 0;
    for (let d = 0; d < 7; d++) {
      act.forEach(wt => {
        const k = slotKey(d, wt.id);
        if (slotFilled(w.slot[k])) return;
        let val;
        if (wt.id === 'pagi') val = { r: chooseCheap(w, D.HEMAT.pagi.map(x => [x]), -9, {}) };
        else if (wt.id === 'malam' && S.set.waktu.siang && d % 2 === 0 && slotFilled(w.slot[slotKey(d, 'siang')]) && !w.slot[slotKey(d, 'siang')].luar) val = { sisa: true };
        else if (wt.id === 'malam' && (d === 3 || d === 5)) val = { r: chooseCheap(w, D.HEMAT.sekali.map(x => [x]), d, used, carried) };
        else val = { r: chooseCheap(w, pairs, d, used, carried) };
        if (val.r) mark(val.r, d);
        w.slot[k] = val; filled++;
      });
    }
    if (!filled) { msg.textContent = 'Semua slot sudah terisi. Kosongkan minggu ini jika ingin mengacak ulang.'; return; }
    msg.textContent = filled + ' slot diisi dengan menu hemat. Ketuk slot untuk mengganti.';
    save(); renderAfterMenu(true);
  });
  $('#copyPrev').addEventListener('click', () => {
    const prevK = ymd(addDays(parseYmd(wk), -7)), prev = peekWeek(prevK), msg = $('#menuMsg');
    msg.className = 'form-msg';
    if (weekIsEmpty(prev)) { msg.className = 'form-msg bad'; msg.textContent = 'Menu minggu ' + weekLabel(prevK) + ' masih kosong.'; return; }
    const w = W();
    if (!weekIsEmpty(w) && !armed($('#copyPrev'), 'Ganti menu minggu ini?')) return;
    w.slot = clone(prev.slot);
    msg.textContent = 'Menu minggu ' + weekLabel(prevK) + ' disalin ke minggu ini.';
    save(); renderAfterMenu(true);
  });
  $('#clearWeek').addEventListener('click', () => {
    const w = peekWeek(wk);
    if (weekIsEmpty(w)) { $('#menuMsg').textContent = 'Minggu ini sudah kosong.'; return; }
    if (!armed($('#clearWeek'), 'Ketuk lagi untuk mengosongkan')) return;
    S.minggu[wk] = normWeek(null);
    $('#menuMsg').className = 'form-msg'; $('#menuMsg').textContent = 'Menu minggu ini dikosongkan.';
    save(); renderAfterMenu(true);
  });
  // Tombol dua langkah untuk tindakan yang mengganti data.
  function armed(btn, text){
    if (btn.dataset.armed) { clearTimeout(btn._t); btn.textContent = btn.dataset.armed; delete btn.dataset.armed; btn.classList.remove('confirm'); return true; }
    btn.dataset.armed = btn.textContent; btn.textContent = text; btn.classList.add('confirm');
    btn._t = setTimeout(() => { if (btn.dataset.armed) { btn.textContent = btn.dataset.armed; delete btn.dataset.armed; btn.classList.remove('confirm'); } }, 3500);
    return false;
  }
  $('#goShop').addEventListener('click', () => { setTab('belanja'); window.scrollTo({ top: $('.tabs').offsetTop - 12, behavior: reduceMotion() ? 'auto' : 'smooth' }); });

  /* ---------- Pemilih menu ---------- */
  let pickAt = null, pickFilter = '';
  function openPicker(d, wid){
    pickAt = { d, w: wid };
    const date = addDays(parseYmd(wk), d);
    $('#pickTitle').textContent = HARI[d] + ' · ' + waktuName(wid);
    $('#pickSub').textContent = date.getDate() + ' ' + BULAN[date.getMonth()] + ' · ' + S.set.porsi + ' porsi';
    $('#pickSearch').value = '';
    renderPicker();
    const dlg = $('#pick');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    flow($('#pickList'));
  }
  const curSlot = () => { const w = W(), k = slotKey(pickAt.d, pickAt.w); return (w.slot[k] = w.slot[k] || { r: [] }); };
  function renderPicker(){
    const sl = curSlot(), q = $('#pickSearch').value.trim().toLowerCase();
    const st = sisaText(pickAt.d, pickAt.w);
    $('#sisaLbl').textContent = st ? st : 'Sisa masakan sebelumnya';
    $$('#pickOpts .opt-chip').forEach(b => b.setAttribute('aria-pressed', String(!!sl[b.dataset.o])));
    $$('#pickFilter button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === pickFilter)));
    const sel = new Set(sl.r || []);
    const rs = resepAll().filter(r => (!pickFilter || r.jenis === pickFilter) && (!q || r.n.toLowerCase().includes(q)));
    rs.sort((a, b) => (sel.has(b.id) - sel.has(a.id)) || 0);
    $('#pickList').innerHTML = rs.length ? rs.map(r =>
      '<li><button type="button" class="pitem" data-id="' + esc(r.id) + '" aria-pressed="' + sel.has(r.id) + '" style="--tone:' + JENIS_TONE[r.jenis] + '">' +
      '<span class="check" aria-hidden="true">' + CHECK + '</span><strong>' + esc(r.n) + '</strong>' +
      '<small>' + JENIS[r.jenis] + ' · ' + (r.menit ? r.menit + ' mnt' : '') + (r.own ? ' · resep sendiri' : '') + '</small>' +
      '<span class="rcost">' + rpE(resepCost(r)) + '</span></button></li>').join('')
      : '<li class="note">Tidak ada menu yang cocok. Tambahkan resep sendiri di tab Resep.</li>';
  }
  $('#pickList').addEventListener('click', (e) => {
    const b = e.target.closest('.pitem'); if (!b) return;
    const sl = curSlot(), id = b.dataset.id;
    sl.sisa = false; sl.luar = false; sl.r = sl.r || [];
    const i = sl.r.indexOf(id);
    if (i >= 0) sl.r.splice(i, 1); else sl.r.push(id);
    b.setAttribute('aria-pressed', String(i < 0));
    $$('#pickOpts .opt-chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
    save();
  });
  $('#pickOpts').addEventListener('click', (e) => {
    const b = e.target.closest('.opt-chip'); if (!b) return;
    const sl = curSlot(), o = b.dataset.o, on = !sl[o];
    sl.sisa = false; sl.luar = false;
    if (on) { sl[o] = true; sl.r = []; }
    save(); renderPicker();
  });
  $('#pickFilter').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; pickFilter = b.dataset.f; renderPicker(); flow($('#pickList')); });
  $('#pickSearch').addEventListener('input', renderPicker);
  function closePicker(){
    const dlg = $('#pick');
    if (dlg.open) { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
  }
  $('#pickDone').addEventListener('click', closePicker);
  $('#pick').addEventListener('close', () => {
    if (pickAt) { const w = W(), k = slotKey(pickAt.d, pickAt.w); if (!slotFilled(w.slot[k])) delete w.slot[k]; }
    pickAt = null; save(); renderAfterMenu();
  });
  $('#pick').addEventListener('click', (e) => { if (e.target === e.currentTarget) closePicker(); });

  function renderAfterMenu(animate){ renderDays(animate); renderSummary(); if (!$('#panelBelanja').hidden) renderShop(); }

  /* ---------- Tab Belanja ---------- */
  const bar = (val, max) => '<div class="bar"><i style="width:' + Math.min(100, max > 0 ? val / max * 100 : 0).toFixed(1) + '%"></i></div>';
  const cmpState = (val, max) => val > max ? 'bad' : val > max * 0.9 ? 'warn' : 'ok';
  // Belanja minggu ini: nominal yang sudah dicatat di Amplop Gajian bila ada, selain itu perkiraan.
  const effPay = (sh) => { const r = recorded(wk); return r ? r.amt : sh.pay; };
  function weekCmp(sh, bg){
    if (!(bg.jatah > 0)) return '';
    const pay = effPay(sh), lbl = recorded(wk) ? 'Belanja minggu ini (dicatat) ' : 'Belanja minggu ini ';
    return '<div class="cmp ' + cmpState(pay, bg.jatah) + '"><div class="cmp-top"><span>Jatah belanja per minggu</span><b>' + rp(bg.jatah) + '</b></div>' + bar(pay, bg.jatah) +
      '<span class="cmp-note">' + lbl + rp(pay) + ' · ' + (pay <= bg.jatah ? '<strong>masih hemat ' + rp(bg.jatah - pay) + '</strong>' : '<strong>lebih ' + rp(pay - bg.jatah) + '</strong>') + '</span></div>';
  }
  function renderBudget(sh){
    const bg = budget(), card = $('#budgetCard'), a = bg.a;
    let html = '<div class="sec-head"><h2 id="budgetTitle">Dibandingkan anggaran</h2></div>';
    if (bg.src === 'auto') {
      const [y, m] = bg.bulan.split('-').map(Number);
      const when = a.diperbarui ? new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(a.diperbarui)) : '';
      html += '<p class="src' + (bg.beda ? ' old' : '') + '"><i class="dot"></i><span>Dari Amplop Gajian: amplop <b>' + esc(a.nama || 'Dapur & makan') + '</b> ' + BULAN[m - 1] + ' ' + y + (when ? ' · diperbarui ' + when : '') + '</span></p>';
      if (bg.beda) html += '<p class="autonote"><strong>Perhatikan:</strong> minggu ini jatuh di bulan yang berbeda dari data amplop. Buka Amplop Gajian di bulan berjalan agar angkanya mengikuti.</p>';
      html += weekCmp(sh, bg);
      // Bila belanja minggu ini sudah dicatat, nominalnya sudah termasuk dalam "sudah dicatat" sehingga tidak dikurangi lagi.
      const rec = recorded(wk), extra = rec ? 0 : sh.pay;
      const after = bg.sisa - extra, s2 = after < 0 ? 'bad' : after < bg.pagu * 0.1 ? 'warn' : 'ok';
      html += '<div class="cmp ' + s2 + '"><div class="cmp-top"><span>Sisa amplop untuk bahan masak bulan ini</span><b>' + rp(bg.sisa) + '</b></div>' + bar(bg.terpakai + extra, bg.pagu) +
        '<span class="cmp-note">Pagu ' + rp(bg.pagu) + ', sudah dicatat ' + rp(bg.terpakai) + (rec ? ' (termasuk belanja minggu ini)' : ' · setelah belanja ini <strong>' + rp(after) + '</strong>') + '</span></div>';
      html += '<details class="guide inner"><summary>Rincian amplop yang dihitung</summary><div class="guide-body"><p class="fhint">Makan di luar, jajan, dan gas tidak dihitung sebagai belanja bahan secara bawaan. Ubah bila perlu.</p><ul class="count-list">' +
        bg.items.map(x => '<li><span>' + esc(x.n) + ' <small>' + rp(x.pagu) + '</small></span><button type="button" class="switch" role="switch" aria-checked="' + x.on + '" data-n="' + esc(x.n) + '" aria-label="Hitung ' + esc(x.n) + '"><span></span></button></li>').join('') +
        '</ul><button type="button" class="link" id="useManual">Pakai anggaran manual saja</button></div></details>';
    } else {
      if (S.set.sumber === 'manual' && a && !a.belumIsi) html += '<p class="src off"><i class="dot"></i><span>Memakai anggaran manual. <button type="button" class="link" id="useAuto">Pakai data Amplop Gajian</button></span></p>';
      else if (a && a.belumIsi) html += '<p class="src old"><i class="dot"></i><span>Amplop Gajian terhubung, tetapi gaji ' + BULAN[Number(a.bulan.split('-')[1]) - 1] + ' belum diisi di sana.</span></p>';
      else html += '<p class="src off"><i class="dot"></i><span>Belum terhubung dengan Amplop Gajian. Buka <a href="../amplop-gajian/">Amplop Gajian</a> sekali di peramban ini agar amplop Dapur &amp; makan terbaca otomatis, atau isi anggaran di bawah.</span></p>';
      html += '<div class="field"><label for="manualBudget">Anggaran belanja bahan masak per bulan</label><div class="money"><span>Rp</span><input id="manualBudget" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (S.set.manual ? fmt(S.set.manual) : '') + '"></div></div>';
      html += '<div id="manualCmp">' + weekCmp(sh, bg) + '</div>';
    }
    card.innerHTML = html;
    const mi = $('#manualBudget');
    if (mi) bindMoney(mi, (v) => { S.set.manual = v; save(); const s2 = shopping(); $('#manualCmp').innerHTML = weekCmp(s2, budget()); renderSummary(s2); });
  }
  $('#budgetCard').addEventListener('click', (e) => {
    const sw = e.target.closest('.switch[data-n]');
    if (sw) { const n = sw.dataset.n; S.set.hitung[n] = sw.getAttribute('aria-checked') !== 'true'; save(); renderBudget(shopping()); const d = $('#budgetCard details'); if (d) d.open = true; renderSummary(); return; }
    if (e.target.id === 'useManual') { S.set.sumber = 'manual'; save(); renderBudget(shopping()); renderSummary(); }
    if (e.target.id === 'useAuto') { S.set.sumber = 'auto'; save(); renderBudget(shopping()); renderSummary(); }
  });

  let editingPrice = null, editingSisa = null;
  // Koreksi jumlah sisa di dapur pada awal minggu (satuan dasar bahan).
  function sisaEditor(x){
    const b = x.b;
    return '<div class="price-edit sisa-edit"><span class="qty"><input class="se-in" inputmode="decimal" autocomplete="off" value="' + (x.have > TINY ? num1(x.have) : '') + '" placeholder="0" aria-label="Sisa ' + esc(b.n) + ' di dapur"><span class="unit">' + esc(b.s) + '</span></span>' +
      '<button type="button" class="primary se-save">Simpan</button>' + (x.fixed ? '<button type="button" class="ghost se-auto">Hitung otomatis</button>' : '<button type="button" class="ghost se-cancel">Batal</button>') +
      '<small>' + (x.carried > TINY ? 'Perkiraan dari minggu lalu ±' + esc(needLbl(x.carried, b.s)) + '. ' : '') + 'Isi jumlah yang benar-benar masih ada di dapur pada awal minggu ini.</small></div>';
  }
  function shopRow(x){
    const b = x.b, buyTxt = x.packs > 1 ? x.packs + ' × ' + b.lbl : b.lbl;
    let html = '<div class="sitem' + (x.bought ? ' done' : '') + '" data-id="' + esc(x.id) + '">' +
      '<button type="button" class="check" role="checkbox" aria-checked="' + x.bought + '" aria-label="' + esc(b.n) + ' sudah di keranjang">' + CHECK + '</button>' +
      '<button type="button" class="sname" data-q="' + esc(b.q) + '">' + esc(b.n) + '</button>' +
      '<button type="button" class="sprice" aria-label="Ubah harga ' + esc(b.n) + '">' + rp(x.cost) + '</button>' +
      '<span class="ssub">Beli ' + esc(buyTxt) + ' · butuh ±' + esc(needLbl(x.need, b.s)) +
      (x.have > TINY ? '<span class="carry-tag">dikurangi sisa ±' + esc(needLbl(x.have, b.s)) + '</span>' : '') +
      (durable(b) ? '<button type="button" class="link set-sisa">' + (x.have > TINY ? 'ubah sisa' : 'ada sisa?') + '</button>' : '') +
      '<button type="button" class="link to-stok">sudah ada</button></span>';
    if (editingSisa === x.id) html += sisaEditor(x);
    if (editingPrice === x.id) {
      html += '<div class="price-edit"><div class="money"><span>Rp</span><input class="pe-in" inputmode="numeric" autocomplete="off" value="' + fmt(b.h) + '" aria-label="Harga per kemasan ' + esc(b.n) + '"></div>' +
        '<button type="button" class="primary pe-save">Simpan</button><button type="button" class="ghost pe-cancel">Batal</button>' +
        '<small>Harga per kemasan ' + esc(b.lbl) + '. Harga ini dipakai untuk perkiraan berikutnya. Ukuran kemasan dapat diubah di tab Harga.</small></div>';
    }
    return html + '</div>';
  }
  function renderShop(animate){
    const sh = shopping();
    renderBudget(sh);
    const has = sh.items.length + sh.extra.length > 0;
    $('#shopEmpty').hidden = has;
    $('#shopActions').hidden = !has;
    $('.shop-tip').hidden = !sh.buy.length;
    const groups = D.KAT.map(k => ({ k, xs: sh.buy.filter(x => (x.b.k || 'lain') === k.id) })).filter(g => g.xs.length);
    $('#shopList').innerHTML = groups.map(g => '<section class="sgrp"><h3>' + esc(g.k.n) + '<small>' + rp(g.xs.reduce((s, x) => s + x.cost, 0)) + '</small></h3>' + g.xs.map(shopRow).join('') + '</section>').join('');
    const nb = sh.buy.filter(x => x.bought).length;
    const pill = $('#cartPill');
    pill.textContent = sh.buy.length ? nb + ' dari ' + sh.buy.length + ' di keranjang' : '';
    pill.className = 'pill' + (sh.buy.length && nb === sh.buy.length ? ' ok' : '');
    pill.hidden = !sh.buy.length;
    $('#sisaBox').hidden = !sh.covered.length && !Object.keys(sh.leftover).length;
    $('#sisaPill').textContent = String(sh.covered.length);
    $('#sisaPill').hidden = !sh.covered.length;
    $('#coverList').innerHTML = sh.covered.map(x => '<li class="item" data-id="' + esc(x.id) + '"><span>' + esc(x.b.n) + '<small>Butuh ±' + esc(needLbl(x.need, x.b.s)) + ' · sisa ±' + esc(needLbl(x.have, x.b.s)) + (x.fixed ? ' (dikoreksi)' : '') + '</small></span><button type="button" class="ghost set-sisa">Ubah sisa</button>' +
      (editingSisa === x.id ? sisaEditor(x) : '') + '</li>').join('');
    $('#coverHead').hidden = !sh.covered.length;
    const lo = Object.keys(sh.leftover).map(id => bahan(id)).filter(Boolean).sort((a, b) => a.n.localeCompare(b.n, 'id'));
    $('#leftNote').hidden = !lo.length;
    $('#leftNote').innerHTML = lo.length ? '<strong>Perkiraan sisa untuk minggu depan:</strong> ' + lo.map(b => esc(b.n) + ' ±' + esc(needLbl(sh.leftover[b.id], b.s))).join(', ') + '. Sisa ini otomatis mengurangi daftar belanja minggu berikutnya.' : '';
    $('#stokBox').hidden = !sh.stok.length;
    $('#stokPill').textContent = String(sh.stok.length);
    $('#stokList').innerHTML = sh.stok.map(x => '<li class="item" data-id="' + esc(x.id) + '"><span>' + esc(x.b.n) + '<small>Butuh ±' + esc(needLbl(x.need, x.b.s)) + ' · kemasan ' + esc(x.b.lbl) + ' ' + rp(x.b.h) + '</small></span><button type="button" class="ghost to-buy">Perlu beli</button></li>').join('');
    $('#extraList').innerHTML = sh.extra.map(x => '<li class="extra-row" data-id="' + esc(x.id) + '"><span>' + esc(x.n) + '</span><b>' + rp(x.h) + '</b><button type="button" class="idel" aria-label="Hapus ' + esc(x.n) + '">×</button></li>').join('');
    $('#tPay').textContent = rp(sh.pay);
    $('#tUsed').textContent = rpE(sh.used);
    const per = sh.cw.meals ? sh.used / (sh.cw.meals * S.set.porsi) : 0;
    $('#totalNote').textContent = has ? 'Nilai bahan yang dimasak sekitar ' + rpE(per) + ' per porsi. Selisih dengan perkiraan bayar adalah sisa kemasan yang menjadi stok untuk minggu berikutnya' + (sh.stok.length ? ', sedangkan bahan yang sudah ada di dapur tidak ikut dibayar' : '') + '.' : '';
    $('#shareList').hidden = !(navigator.share && has);
    renderDone(sh);
    if (animate) flow($('#shopList'));
    renderSummary(sh);
  }
  $('#shopList').addEventListener('click', (e) => {
    const row = e.target.closest('.sitem'); if (!row) return;
    const id = row.dataset.id, w = W();
    if (e.target.closest('.check')) {
      w.beli[id] = !w.beli[id]; if (!w.beli[id]) delete w.beli[id];
      save(); renderShop();
      return;
    }
    if (e.target.closest('.sname')) { copyText(e.target.closest('.sname').dataset.q, '“' + e.target.closest('.sname').dataset.q + '” disalin. Tempel di pencarian Astro atau GoMart.'); return; }
    if (e.target.closest('.to-stok')) { w.stok[id] = true; delete w.beli[id]; save(); renderShop(); toast(bahan(id).n + ' dipindahkan ke “Sudah ada di dapur”.'); return; }
    if (e.target.closest('.set-sisa')) { editingSisa = editingSisa === id ? null : id; editingPrice = null; renderShop(); const inp = $('.se-in'); if (inp) inp.focus(); return; }
    if (e.target.closest('.se-cancel')) { editingSisa = null; renderShop(); return; }
    if (e.target.closest('.se-auto')) { delete w.awal[id]; editingSisa = null; save(); renderShop(); toast('Sisa ' + bahan(id).n + ' kembali dihitung otomatis.'); return; }
    if (e.target.closest('.se-save')) { saveSisa(id, $('.se-in', row).value); return; }
    if (e.target.closest('.sprice')) { editingPrice = editingPrice === id ? null : id; editingSisa = null; renderShop(); const inp = $('.pe-in'); if (inp) { bindMoney(inp, () => {}); inp.focus(); inp.select(); } return; }
    if (e.target.closest('.pe-cancel')) { editingPrice = null; renderShop(); return; }
    if (e.target.closest('.pe-save')) { setPrice(id, digits($('.pe-in').value)); editingPrice = null; renderShop(); toast('Harga ' + bahan(id).n + ' diperbarui.'); }
  });
  function saveSisa(id, raw){
    const v = String(raw).trim() === '' ? 0 : dec(raw);
    W().awal[id] = v; editingSisa = null; save(); renderShop();
    toast('Sisa ' + bahan(id).n + ' dicatat ±' + needLbl(v, bahan(id).s) + '.');
  }
  $('#shopList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('se-in')) { e.preventDefault(); saveSisa(e.target.closest('[data-id]').dataset.id, e.target.value); return; }
    if (e.key === 'Enter' && e.target.classList.contains('pe-in')) { e.preventDefault(); const row = e.target.closest('.sitem'); setPrice(row.dataset.id, digits(e.target.value)); editingPrice = null; renderShop(); }
  });
  $('#coverList').addEventListener('click', (e) => {
    const li = e.target.closest('[data-id]'); if (!li) return;
    const id = li.dataset.id, w = W();
    if (e.target.closest('.set-sisa')) { editingSisa = editingSisa === id ? null : id; renderShop(); const inp = $('#coverList .se-in'); if (inp) inp.focus(); return; }
    if (e.target.closest('.se-cancel')) { editingSisa = null; renderShop(); return; }
    if (e.target.closest('.se-auto')) { delete w.awal[id]; editingSisa = null; save(); renderShop(); return; }
    if (e.target.closest('.se-save')) saveSisa(id, $('.se-in', li).value);
  });
  $('#coverList').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList.contains('se-in')) { e.preventDefault(); saveSisa(e.target.closest('[data-id]').dataset.id, e.target.value); } });
  $('#stokList').addEventListener('click', (e) => {
    const b = e.target.closest('.to-buy'); if (!b) return;
    const id = b.closest('[data-id]').dataset.id; W().stok[id] = false; save(); renderShop();
  });
  $('#extraList').addEventListener('click', (e) => {
    const b = e.target.closest('.idel'); if (!b) return;
    const w = W(), id = b.closest('[data-id]').dataset.id; w.extra = w.extra.filter(x => x.id !== id); save(); renderShop();
  });
  bindMoney($('#extraPrice'), () => {});
  function addExtra(){
    const n = $('#extraName').value.trim(), h = digits($('#extraPrice').value);
    if (!n) { $('#extraName').focus(); return; }
    W().extra.push({ id: newId(), n, h });
    $('#extraName').value = ''; $('#extraPrice').value = '';
    save(); renderShop(); $('#extraName').focus();
  }
  $('#extraAdd').addEventListener('click', addExtra);
  $('#extraName').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#extraPrice').focus(); } });
  $('#extraPrice').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addExtra(); } });

  function listText(){
    const sh = shopping(), lines = [];
    const notYet = sh.buy.filter(x => !x.bought), some = notYet.length && notYet.length < sh.buy.length;
    const rows = some ? notYet : sh.buy;
    lines.push('Daftar belanja ' + weekLabel(wk, true) + (some ? ' (belum dibeli)' : ''));
    D.KAT.forEach(k => {
      const xs = rows.filter(x => (x.b.k || 'lain') === k.id); if (!xs.length) return;
      lines.push('', k.n.toUpperCase());
      xs.forEach(x => lines.push('- ' + x.b.n + ' — ' + (x.packs > 1 ? x.packs + ' × ' + x.b.lbl : x.b.lbl) + ' (±' + rp(x.cost) + ')'));
    });
    if (sh.extra.length) { lines.push('', 'LAINNYA'); sh.extra.forEach(x => lines.push('- ' + x.n + (x.h ? ' (±' + rp(x.h) + ')' : ''))); }
    const total = rows.reduce((s, x) => s + x.cost, 0) + sh.extra.reduce((s, x) => s + x.h, 0);
    lines.push('', 'Perkiraan total: ' + rp(total));
    return lines.join('\n');
  }
  async function copyText(text, okMsg){
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); toast(okMsg); return true; }
    } catch (e) {}
    const ta = $('#copyFallback'); ta.hidden = false; ta.value = text; ta.focus(); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    if (ok) { ta.hidden = true; toast(okMsg); } else toast('Salin manual dari kotak teks di bawah.');
    return ok;
  }
  $('#copyList').addEventListener('click', () => copyText(listText(), 'Daftar belanja disalin. Tempel di catatan, WhatsApp, atau pakai saat mencari di Astro dan GoMart.'));
  $('#shareList').addEventListener('click', async () => {
    try { await navigator.share({ title: 'Daftar belanja ' + weekLabel(wk, true), text: listText() }); } catch (e) {}
  });

  /* ---------- Selesai belanja: catat ke Amplop Gajian ---------- */
  const CONFIRM_KEY = 'menu-kost-dicatat';   // ditulis Amplop Gajian setelah pengguna menekan Catat
  function recorded(k){
    try { const o = JSON.parse(localStorage.getItem(CONFIRM_KEY) || '{}') || {}; const r = o[k]; return r && r.amt > 0 ? r : null; } catch (e) { return null; }
  }
  const ketOf = (k) => 'Belanja mingguan ' + weekLabel(k, true) + ' (Menu Masak)';
  function cartTotal(sh){
    const inCart = sh.buy.filter(x => x.bought);
    return inCart.length ? inCart.reduce((s, x) => s + x.cost, 0) + sh.extra.reduce((s, x) => s + x.h, 0) : sh.pay;
  }
  function renderDone(sh){
    const card = $('#doneCard'), w = peekWeek(wk), rec = recorded(wk);
    card.hidden = !(sh.buy.length || sh.extra.length || rec);
    if (card.hidden) return;
    const inp = $('#paidIn');
    if (document.activeElement !== inp) inp.value = fmt(w && w.bayar ? w.bayar : cartTotal(sh));
    const st = $('#doneStatus');
    if (rec) {
      const d = rec.date ? rec.date.split('-').reverse().join('/') : '';
      st.className = 'done-status ok';
      st.innerHTML = 'Sudah dicatat di Amplop Gajian: <b>' + rp(rec.amt) + '</b>' + (d ? ' pada ' + d : '') + '.';
      $('#toAmplop').textContent = 'Catat lagi ke Amplop Gajian';
    } else {
      st.className = 'done-status';
      st.textContent = 'Belum dicatat ke amplop Dapur & makan.';
      $('#toAmplop').textContent = 'Catat ke Amplop Gajian';
    }
    const est = sh.pay, paid = digits(inp.value);
    $('#paidDiff').textContent = paid && paid !== est ? 'Perkiraan aplikasi ' + rp(est) + ' · selisih ' + (paid > est ? '+' : '−') + rp(Math.abs(paid - est)) + '. Perbarui harga di daftar agar perkiraan berikutnya lebih tepat.' : '';
  }
  bindMoney($('#paidIn'), (v) => { const w = W(); w.bayar = v; save(); renderDone(shopping()); });
  $('#toAmplop').addEventListener('click', () => {
    const amt = digits($('#paidIn').value);
    if (!amt) { toast('Isi total yang dibayar lebih dulu.'); $('#paidIn').focus(); return; }
    if (recorded(wk) && !armed($('#toAmplop'), 'Sudah pernah dicatat. Ketuk lagi bila yakin')) return;
    W().bayar = amt; writeNow();
    const q = new URLSearchParams({ jumlah: String(amt), ket: ketOf(wk), ref: wk });
    location.href = '../amplop-gajian/#catat?' + q.toString();
  });

  /* ---------- Tab Harga ---------- */
  function setPrice(id, h, isi){
    const now = Date.now();
    if (D.BAHAN[id]) {
      const o = Object.assign({}, S.harga[id] || {}), cur = bahan(id);
      if (h !== undefined && h !== cur.h) { o.prev = cur.h; o.h = h; o.t = now; }
      if (isi !== undefined && isi > 0 && isi !== cur.isi) { o.isi = isi; o.t = now; }
      S.harga[id] = o;
    } else if (S.bahan[id]) {
      const c = S.bahan[id];
      if (h !== undefined && h !== c.h) { c.prev = c.h; c.h = h; c.t = now; }
      if (isi !== undefined && isi > 0) c.isi = isi;
    }
    save();
  }
  function changeTxt(b){
    if (!b.own && !b.ownPrice) return 'Harga awal' + (markupOn() ? ' + ' + S.set.markup + '%' : '') + (b.edited ? ' · kemasan diubah' : '');
    if (!b.edited) return 'Bahan sendiri';
    let t = 'Diperbarui ' + new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'short' }).format(new Date(b.t));
    if (b.prev !== undefined && b.prev !== b.h) t += ' · <span class="chg ' + (b.h > b.prev ? 'up' : 'down') + '">' + (b.h > b.prev ? 'naik ' : 'turun ') + rp(Math.abs(b.h - b.prev)) + '</span>';
    return t;
  }
  function renderToko(){
    $$('#tokoSeg button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === S.set.toko)));
    $('#markupRow').hidden = S.set.toko !== 'online';
    $('#markupVal').textContent = S.set.markup + '%';
    $('#markupMinus').disabled = S.set.markup <= 0;
    $('#markupPlus').disabled = S.set.markup >= 60;
    const n = bahanIds().map(bahan).filter(b => b && !b.own && !b.ownPrice).length;
    $('#tokoNote').textContent = S.set.toko === 'online'
      ? 'Belanja lewat aplikasi umumnya lebih mahal daripada pasar. Tambahan ' + S.set.markup + '% berlaku untuk ' + n + ' bahan yang harganya belum Anda perbarui; angka bawaan 20% hanya perkiraan kasar, sesuaikan setelah membandingkan dengan struk Anda.'
      : 'Harga awal memakai harga pasar tradisional tanpa tambahan. ' + n + ' bahan masih memakai harga awal.';
  }
  $('#tokoSeg').addEventListener('click', (e) => {
    const x = e.target.closest('button'); if (!x) return;
    S.set.toko = x.dataset.v; save(); renderToko(); renderPrices(); renderSummary();
  });
  function stepMarkup(d){ S.set.markup = Math.max(0, Math.min(60, S.set.markup + d)); save(); renderToko(); renderPrices(); renderSummary(); }
  $('#markupMinus').addEventListener('click', () => stepMarkup(-5));
  $('#markupPlus').addEventListener('click', () => stepMarkup(5));
  function renderPrices(animate){
    renderToko();
    const q = $('#priceSearch').value.trim().toLowerCase();
    const all = bahanIds().map(bahan).filter(b => b && (!q || b.n.toLowerCase().includes(q)));
    const groups = D.KAT.map(k => ({ k, xs: all.filter(b => (b.k || 'lain') === k.id).sort((a, c) => a.n.localeCompare(c.n, 'id')) })).filter(g => g.xs.length);
    $('#priceList').innerHTML = groups.length ? groups.map(g => '<section class="sgrp"><h3>' + esc(g.k.n) + '</h3>' + g.xs.map(b =>
      '<div class="prow" data-id="' + esc(b.id) + '"><span class="prow-name">' + esc(b.n) + '<small>per kemasan ' + esc(b.lbl) + '</small></span>' +
      '<div class="money"><span>Rp</span><input class="p-h" inputmode="numeric" autocomplete="off" value="' + fmt(b.h) + '" aria-label="Harga ' + esc(b.n) + '"></div>' +
      '<div class="prow-meta"><span>' + changeTxt(b) + '</span><span class="isi-row">Isi <span class="qty sm"><input class="p-isi" inputmode="decimal" autocomplete="off" value="' + num1(b.isi) + '" aria-label="Isi kemasan ' + esc(b.n) + '"><span>' + esc(b.s) + '</span></span></span>' +
      (b.own ? '<button type="button" class="link p-del">Hapus</button>' : ((b.edited || b.ownPrice) ? '<button type="button" class="link p-reset">Harga awal</button>' : '')) + '</div></div>').join('') + '</section>').join('')
      : '<p class="empty">Bahan tidak ditemukan. Tambahkan sebagai bahan sendiri di bawah.</p>';
    $$('#priceList .p-h').forEach(inp => bindMoney(inp, () => {}));
    if (animate) flow($('#priceList'));
  }
  $('#priceSearch').addEventListener('input', () => renderPrices());
  $('#priceList').addEventListener('change', (e) => {
    const row = e.target.closest('.prow'); if (!row) return;
    const id = row.dataset.id;
    if (e.target.classList.contains('p-h')) setPrice(id, digits(e.target.value));
    if (e.target.classList.contains('p-isi')) { const v = dec(e.target.value); if (v > 0) setPrice(id, undefined, v); }
    // Perbarui baris ini saja agar fokus pada isian berikutnya tidak hilang.
    const b = bahan(id);
    $('.prow-name small', row).textContent = 'per kemasan ' + b.lbl;
    $('.prow-meta > span', row).innerHTML = changeTxt(b);
    if (!b.own && (b.edited || b.ownPrice) && !$('.p-reset', row)) $('.prow-meta', row).insertAdjacentHTML('beforeend', '<button type="button" class="link p-reset">Harga awal</button>');
    e.target.value = e.target.classList.contains('p-h') ? fmt(b.h) : num1(b.isi);
    renderSummary();
    toast('Harga ' + b.n + ' disimpan.');
  });
  $('#priceList').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.blur(); } });
  $('#priceList').addEventListener('click', (e) => {
    const row = e.target.closest('.prow'); if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest('.p-reset')) { delete S.harga[id]; save(); renderPrices(); renderSummary(); toast('Harga ' + bahan(id).n + ' dikembalikan ke harga awal.'); }
    if (e.target.closest('.p-del')) {
      const used = resepAll().filter(r => r.bahan.some(x => x[0] === id));
      if (used.length) { toast('Masih dipakai di resep ' + used.map(r => r.n).join(', ') + '.'); return; }
      if (!armed(e.target.closest('.p-del'), 'Yakin hapus?')) return;
      delete S.bahan[id]; save(); renderPrices(); renderSummary();
    }
  });
  $('#resetPrices').addEventListener('click', () => {
    if (!Object.keys(S.harga).length) { $('#priceMsg').textContent = 'Semua harga masih memakai harga awal.'; return; }
    if (!armed($('#resetPrices'), 'Ketuk lagi untuk mengembalikan semua')) return;
    S.harga = {}; save(); renderPrices(true); renderSummary();
    $('#priceMsg').textContent = 'Semua harga bahan bawaan dikembalikan ke harga awal.';
  });
  // Formulir bahan sendiri
  $('#nbKat').innerHTML = D.KAT.map(k => '<option value="' + k.id + '">' + esc(k.n) + '</option>').join('');
  $('#nbSat').innerHTML = SATUAN.map(s => '<option>' + s + '</option>').join('');
  bindMoney($('#nbHarga'), () => {});
  $('#nbAdd').addEventListener('click', () => {
    const n = $('#nbName').value.trim(), isi = dec($('#nbIsi').value), h = digits($('#nbHarga').value), m = $('#nbMsg');
    m.className = 'form-msg bad';
    if (!n) { m.textContent = 'Isi nama bahan.'; $('#nbName').focus(); return; }
    if (bahanIds().map(bahan).some(b => b.n.toLowerCase() === n.toLowerCase())) { m.textContent = 'Bahan dengan nama ini sudah ada.'; return; }
    if (!isi) { m.textContent = 'Isi jumlah per kemasan, misalnya 500.'; $('#nbIsi').focus(); return; }
    const id = 'own_' + newId();
    S.bahan[id] = { n, k: $('#nbKat').value, s: $('#nbSat').value, isi, h, stok: false, q: n.toLowerCase() };
    save();
    $('#nbName').value = ''; $('#nbIsi').value = ''; $('#nbHarga').value = '';
    m.className = 'form-msg'; m.textContent = n + ' ditambahkan. Bahan ini sekarang dapat dipakai di resep sendiri.';
    renderPrices();
  });

  /* ---------- Tab Resep ---------- */
  let resepFilter = '';
  function renderRecipes(animate){
    $$('#resepFilter button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === resepFilter)));
    const rs = resepAll().filter(r => !resepFilter || r.jenis === resepFilter);
    rs.sort((a, b) => (b.own - a.own) || resepCost(a) - resepCost(b));
    $('#recipeList').innerHTML = rs.map(r => {
      const names = r.bahan.map(([id]) => bahan(id)).filter(b => b && !b.stok).map(b => b.n.replace(/ \(.*\)$/, ''));
      return '<li class="rcard" data-id="' + esc(r.id) + '" style="--tone:' + JENIS_TONE[r.jenis] + '"><div class="rcard-top"><span class="ico sm">' + svg(r.jenis === 'sayur' ? 'leaf' : r.jenis === 'sekali' ? 'bowl' : 'pot') + '</span><div><h3>' + esc(r.n) + '</h3>' +
        '<div class="rmeta"><span class="tag ' + r.jenis + '">' + JENIS[r.jenis] + '</span>' + (r.own ? '<span class="tag own">Resep sendiri</span>' : '') + (r.menit ? '<span>' + r.menit + ' menit</span>' : '') + '</div></div>' +
        '<span class="rcost" title="Biaya per porsi">' + rpE(resepCost(r)) + '</span></div>' +
        '<p class="rbahan">' + esc(names.join(', ')) + '</p>' + (r.catatan ? '<p class="rnote">' + esc(r.catatan) + '</p>' : '') +
        '<div class="ractions">' + (r.own ? '<button type="button" class="ghost r-edit">Ubah</button><button type="button" class="ghost r-del">Hapus</button>' : '<button type="button" class="ghost r-copy">Salin &amp; ubah</button>') + '</div></li>';
    }).join('');
    if (animate) flow($('#recipeList'));
  }
  $('#resepFilter').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; resepFilter = b.dataset.f; renderRecipes(true); });
  $('#recipeList').addEventListener('click', (e) => {
    const card = e.target.closest('.rcard'); if (!card) return;
    const r = resepById(card.dataset.id); if (!r) return;
    if (e.target.closest('.r-edit')) openEditor(r, false);
    if (e.target.closest('.r-copy')) openEditor(r, true);
    if (e.target.closest('.r-del')) {
      if (!armed(e.target.closest('.r-del'), 'Yakin hapus?')) return;
      S.resep = S.resep.filter(x => x.id !== r.id);
      Object.values(S.minggu).forEach(w => Object.values(w.slot).forEach(sl => { if (sl.r) sl.r = sl.r.filter(id => id !== r.id); }));
      save(); renderRecipes(); renderDays(); renderSummary();
    }
  });
  $('#newResep').addEventListener('click', () => openEditor(null, false));

  let ed = null;
  function bahanOptions(sel){
    return D.KAT.map(k => {
      const xs = bahanIds().map(bahan).filter(b => (b.k || 'lain') === k.id).sort((a, c) => a.n.localeCompare(c.n, 'id'));
      return xs.length ? '<optgroup label="' + esc(k.n) + '">' + xs.map(b => '<option value="' + esc(b.id) + '"' + (b.id === sel ? ' selected' : '') + '>' + esc(b.n) + '</option>').join('') + '</optgroup>' : '';
    }).join('');
  }
  function openEditor(r, asCopy){
    ed = { id: r && !asCopy ? r.id : null, jenis: r ? r.jenis : 'lauk', bahan: r ? clone(r.bahan) : [['telur', 1]] };
    $('#edTitle').textContent = r && !asCopy ? 'Ubah resep' : 'Resep sendiri';
    $('#edName').value = r ? (asCopy ? r.n + ' (versi saya)' : r.n) : '';
    $('#edMenit').value = r && r.menit ? String(r.menit) : '';
    $('#edNote').value = r ? r.catatan || '' : '';
    $('#edMsg').textContent = '';
    renderEditor();
    const dlg = $('#editor');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function renderEditor(){
    $$('#edJenis button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === ed.jenis)));
    $('#edBahan').innerHTML = ed.bahan.map(([id, q], i) => {
      const b = bahan(id);
      return '<li class="ed-row" data-i="' + i + '"><select class="ed-b" aria-label="Bahan">' + bahanOptions(id) + '</select>' +
        '<span class="qty sm"><input class="ed-q" inputmode="decimal" autocomplete="off" value="' + (q ? num1(q) : '') + '" aria-label="Jumlah"><span>' + esc(b ? b.s : '') + '</span></span>' +
        '<button type="button" class="idel" aria-label="Hapus bahan">×</button></li>';
    }).join('');
    const cost = resepCost({ bahan: ed.bahan });
    $('#edCost').textContent = 'Perkiraan biaya per porsi: ' + rpE(cost) + (ed.jenis === 'sekali' ? '' : ' (belum termasuk nasi)') + '.';
  }
  $('#edJenis').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; ed.jenis = b.dataset.v; renderEditor(); });
  $('#edBahan').addEventListener('change', (e) => {
    const row = e.target.closest('.ed-row'); if (!row) return; const i = Number(row.dataset.i);
    if (e.target.classList.contains('ed-b')) ed.bahan[i][0] = e.target.value;
    if (e.target.classList.contains('ed-q')) ed.bahan[i][1] = dec(e.target.value);
    renderEditor();
  });
  $('#edBahan').addEventListener('click', (e) => {
    const b = e.target.closest('.idel'); if (!b) return;
    ed.bahan.splice(Number(b.closest('.ed-row').dataset.i), 1); renderEditor();
  });
  $('#edAddBahan').addEventListener('click', () => { ed.bahan.push(['bawang_merah', 0]); renderEditor(); const qs = $$('#edBahan .ed-b'); if (qs.length) qs[qs.length - 1].focus(); });
  $('#edClose').addEventListener('click', () => $('#editor').close());
  $('#editor').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#editor').close(); });
  $('#edSave').addEventListener('click', () => {
    $$('#edBahan .ed-q').forEach((inp, i) => { ed.bahan[i][1] = dec(inp.value); });
    const n = $('#edName').value.trim(), m = $('#edMsg');
    const items = ed.bahan.filter(([id, q]) => bahan(id) && q > 0);
    m.className = 'form-msg bad';
    if (!n) { m.textContent = 'Isi nama menu.'; $('#edName').focus(); return; }
    if (!items.length) { m.textContent = 'Tambahkan minimal satu bahan beserta jumlahnya.'; return; }
    const merged = {}; items.forEach(([id, q]) => { merged[id] = (merged[id] || 0) + q; });
    const rec = { id: ed.id || 'own_' + newId(), n, jenis: ed.jenis, menit: parseInt($('#edMenit').value, 10) || 0, bahan: Object.keys(merged).map(id => [id, merged[id]]), catatan: $('#edNote').value.trim() };
    const i = S.resep.findIndex(x => x.id === rec.id);
    if (i >= 0) S.resep[i] = rec; else S.resep.push(rec);
    save(); $('#editor').close();
    resepFilter = ''; renderRecipes(true); renderDays(); renderSummary();
    toast(n + ' disimpan dan dapat dipilih di tab Menu.');
  });

  /* ---------- Input uang ---------- */
  function bindMoney(el, set){
    el.addEventListener('input', () => {
      const pos = el.value.length - el.selectionStart;
      const v = digits(el.value);
      el.value = v ? fmt(v) : '';
      try { const p = Math.max(0, el.value.length - pos); el.setSelectionRange(p, p); } catch (e) {}
      set(v);
    });
  }

  /* ---------- Tab ---------- */
  const TABS = { menu:['#tabMenu', '#panelMenu'], belanja:['#tabBelanja', '#panelBelanja'], harga:['#tabHarga', '#panelHarga'], resep:['#tabResep', '#panelResep'] };
  function setTab(t){
    Object.keys(TABS).forEach(k => { $(TABS[k][0]).setAttribute('aria-selected', String(k === t)); $(TABS[k][1]).hidden = k !== t; });
    $('.tabs').dataset.tab = t;
    if (t === 'menu') { renderDays(); flow($('#panelMenu')); }
    if (t === 'belanja') { renderShop(); flow($('#panelBelanja')); }
    if (t === 'harga') { renderPrices(); flow($('#panelHarga')); }
    if (t === 'resep') { renderRecipes(); flow($('#panelResep')); }
    try { sessionStorage.setItem('menu-kost-tab', t); } catch (e) {}
  }
  Object.keys(TABS).forEach(k => $(TABS[k][0]).addEventListener('click', () => setTab(k)));
  $('.tabs').addEventListener('keydown', (e) => {
    const keys = Object.keys(TABS), cur = keys.indexOf($('.tabs').dataset.tab);
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = keys[(cur + (e.key === 'ArrowRight' ? 1 : keys.length - 1)) % keys.length];
    setTab(next); $(TABS[next][0]).focus();
  });
  const curTab = () => $('.tabs').dataset.tab;
  function shiftWeek(n){
    writeNow();
    wk = ymd(addDays(parseYmd(wk), 7 * n));
    editingPrice = null; editingSisa = null;
    renderAll(true);
  }
  $('#prevW').addEventListener('click', () => shiftWeek(-1));
  $('#nextW').addEventListener('click', () => shiftWeek(1));
  function renderAll(animate){
    renderSetup();
    const t = curTab();
    if (t === 'menu') renderDays(animate);
    if (t === 'belanja') renderShop(animate);
    if (t === 'harga') renderPrices();
    if (t === 'resep') renderRecipes();
    renderSummary();
    $('#menuMsg').textContent = '';
  }
  // Data amplop dapat berubah di tab lain (Amplop Gajian) — muat ulang anggaran saat kembali.
  window.addEventListener('storage', (e) => { if (e.key === AMPLOP_KEY || e.key === CONFIRM_KEY) { renderSummary(); if (curTab() === 'belanja') renderShop(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { renderSummary(); if (curTab() === 'belanja') renderShop(); } });
  window.addEventListener('pageshow', (e) => { if (e.persisted) { renderSummary(); if (curTab() === 'belanja') renderShop(); } });

  /* ---------- Cadangan ---------- */
  function readMeta(){ try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function writeMeta(patch){ try { localStorage.setItem(META_KEY, JSON.stringify(Object.assign(readMeta(), patch))); } catch (e) {} }
  function hasData(){ return Object.keys(S.minggu).some(k => !weekIsEmpty(S.minggu[k])) || Object.keys(S.harga).length > 0 || S.resep.length > 0 || Object.keys(S.bahan).length > 0; }
  function exportBackup(){
    writeNow();
    const data = { app:'menu-kost', versi:1, diekspor:new Date().toISOString(), data: S };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const d = new Date();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'menu-masak-cadangan-' + ymd(d) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    writeMeta({ lastBackup: Date.now() });
    const m = $('#bkMsg'); m.className = 'form-msg'; m.textContent = 'Cadangan diunduh. Simpan file tersebut di tempat yang aman, misalnya Google Drive.';
    renderBackupState();
  }
  function renderBackupState(){
    const meta = readMeta(), now = Date.now();
    const days = meta.lastBackup ? Math.floor((now - meta.lastBackup) / DAY) : null;
    $('#bkLast').textContent = meta.lastBackup
      ? 'Cadangan terakhir: ' + new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(new Date(meta.lastBackup)) + (days ? ' (' + days + ' hari lalu)' : ' (hari ini)')
      : 'Belum pernah mengunduh cadangan.';
    const due = hasData() && (days === null || days >= 14) && !(meta.snoozeUntil && now < meta.snoozeUntil) && (meta.firstUse && now - meta.firstUse > 2 * DAY);
    const bn = $('#bkBanner'); bn.hidden = !due;
    if (due) {
      $('#bkBannerTitle').textContent = days === null ? 'Amankan menu dan harga Anda' : 'Sudah ' + days + ' hari sejak cadangan terakhir';
      $('#bkBannerText').textContent = 'Data hanya tersimpan di perangkat ini dan dapat hilang bila data peramban dibersihkan. Unduh cadangan, lalu simpan di tempat aman.';
    }
  }
  $('#bkExport').addEventListener('click', exportBackup);
  $('#bkNow').addEventListener('click', exportBackup);
  $('#bkLater').addEventListener('click', () => { writeMeta({ snoozeUntil: Date.now() + 5 * DAY }); renderBackupState(); });
  function askPersist(){
    const meta = readMeta();
    if (meta.persistAsked || !navigator.storage || !navigator.storage.persist) return;
    writeMeta({ persistAsked: true });
    navigator.storage.persist().catch(() => {});
  }
  let bkPending = null;
  $('#bkFile').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    const m = $('#bkMsg'); m.textContent = '';
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const o = JSON.parse(String(rd.result));
        if (!o || o.app !== 'menu-kost' || typeof o.data !== 'object') throw new Error('format');
        bkPending = o.data;
        const nW = Object.keys(o.data.minggu || {}).length, nH = Object.keys(o.data.harga || {}).length + Object.keys(o.data.bahan || {}).length, nR = (o.data.resep || []).length;
        $('#bkConfirmText').textContent = 'Pulihkan cadangan berisi ' + nW + ' minggu menu, ' + nH + ' harga pribadi, dan ' + nR + ' resep sendiri? Seluruh data di perangkat ini akan diganti dengan isi cadangan.';
        $('#bkConfirm').hidden = false;
      } catch (err) {
        m.className = 'form-msg bad'; m.textContent = 'File tidak dapat dibaca. Pastikan Anda memilih file cadangan Menu Masak Mingguan (.json).';
      }
    };
    rd.onerror = () => { m.className = 'form-msg bad'; m.textContent = 'File gagal dibuka. Coba pilih ulang file cadangan.'; };
    rd.readAsText(f);
  });
  $('#bkNo').addEventListener('click', () => { bkPending = null; $('#bkConfirm').hidden = true; });
  $('#bkYes').addEventListener('click', () => {
    if (!bkPending) return;
    S = normState(bkPending); bkPending = null; $('#bkConfirm').hidden = true;
    writeNow(); renderAll(true);
    const m = $('#bkMsg'); m.className = 'form-msg'; m.textContent = 'Data berhasil dipulihkan dari cadangan.';
    renderBackupState();
  });

  // Pemasangan sebagai aplikasi (PWA)
  const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let installEvt = null;
  function renderInstall(){
    const box = $('#installBox');
    if (standalone()) { box.hidden = true; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (installEvt) { box.hidden = false; $('#installBtn').hidden = false; }
    else if (ios) {
      box.hidden = false; $('#installBtn').hidden = true;
      $('#installText').textContent = 'Di iPhone atau iPad: buka di Safari, ketuk tombol Bagikan, lalu pilih "Tambahkan ke Layar Utama". Catatan: di iPhone, aplikasi yang dipasang memiliki penyimpanan sendiri, sehingga anggaran dari Amplop Gajian hanya terbaca bila keduanya dibuka langsung di Safari.';
    } else box.hidden = true;
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; renderInstall(); });
  $('#installBtn').addEventListener('click', async () => {
    if (!installEvt) return;
    installEvt.prompt();
    try { await installEvt.userChoice; } catch (e) {}
    installEvt = null; renderInstall();
  });
  window.addEventListener('appinstalled', () => { installEvt = null; renderInstall(); });

  /* ---------- Mulai ---------- */
  if (!readMeta().firstUse) writeMeta({ firstUse: Date.now() });
  let startTab = 'menu';
  try { const t = sessionStorage.getItem('menu-kost-tab'); if (t && TABS[t]) startTab = t; } catch (e) {}
  setTab(startTab);
  renderAll(true);
  setStatus('local');
  renderBackupState();
  renderInstall();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  // Untuk tes otomatis.
  window.__menuKost = { shopping: () => shopping(), budget: () => budget(), state: () => S, week: () => wk };
})();
