"""Tes otomatis Menu Masak Mingguan.

Menjalankan aplikasi di peramban tanpa layar (Chromium lewat Playwright) dan
memeriksa perhitungan utama. Jalankan dari folder repositori:

    pip install playwright && python -m playwright install chromium
    python tests/test_app.py
"""
import asyncio
import calendar
import datetime
import functools
import http.server
import json
import pathlib
import sys
import threading

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
LS_KEY = "menu-kost-v1"
AMPLOP_KEY = "amplop-gajian-dapur"

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK   " if cond else "  GAGAL") + "  " + name + (("  — " + str(detail)) if detail and not cond else ""))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/index.html"


async def fresh(browser, url, scheme="light", setup=None, market=True):
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, color_scheme=scheme,
                                    permissions=["clipboard-read", "clipboard-write"])
    # Tes perhitungan memakai harga pasar (tanpa tambahan harga aplikasi) agar angkanya pasti.
    # Diisi sebelum halaman dimuat pertama kali, dan hanya sekali.
    init = "if (!localStorage.getItem('__tes')) { localStorage.setItem('__tes', '1');"
    if market:
        init += f" localStorage.setItem('{LS_KEY}', JSON.stringify({{ set: {{ toko: 'pasar' }} }}));"
    if setup:
        init += " " + setup + ";"
    await ctx.add_init_script(init + " }")
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    await page.goto(url)
    await page.wait_for_timeout(250)
    return ctx, page, errors


async def pick(page, d, w, ids):
    await page.click(f'.slot[data-d="{d}"][data-w="{w}"]')
    for i in ids:
        await page.click(f'#pickList .pitem[data-id="{i}"]')
    await page.click("#pickDone")
    await page.wait_for_timeout(120)


async def pick_opt(page, d, w, opt):
    await page.click(f'.slot[data-d="{d}"][data-w="{w}"]')
    await page.click(f'#pickOpts [data-o="{opt}"]')
    await page.click("#pickDone")
    await page.wait_for_timeout(120)


async def sh(page):
    return await page.evaluate("""() => { const s = window.__menuKost.shopping();
      return { pay: s.pay, used: s.used, meals: s.cw.meals,
               items: Object.fromEntries(s.items.map(x => [x.id, { need: x.need, packs: x.packs, cost: x.cost, stok: x.stok, have: x.have }])) }; }""")


async def num(page, sel):
    t = await page.text_content(sel) or ""
    return int("".join(ch for ch in t if ch.isdigit()) or 0)


async def test_layout(b, url):
    print("Tampilan awal")
    for scheme in ("light", "dark"):
        ctx, page, errors = await fresh(b, url, scheme)
        check(f"{scheme}: 7 kartu hari", await page.locator(".day").count() == 7)
        check(f"{scheme}: 14 slot (siang & malam)", await page.locator(".slot").count() == 14)
        for tab in ("#tabMenu", "#tabBelanja", "#tabHarga", "#tabResep"):
            await page.click(tab)
            await page.wait_for_timeout(150)
            wide = await page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            check(f"{scheme} {tab}: tidak menggulir ke samping", not wide)
        check(f"{scheme}: tanpa galat skrip", not errors, errors)
        await ctx.close()


async def test_sisa_and_portions(b, url):
    print("Kebutuhan bahan, sisa masakan, dan porsi")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 0, "siang", ["telur_dadar"])
    await pick_opt(page, 0, "malam", "sisa")
    s = await sh(page)
    check("sisa dihitung sebagai porsi kedua", s["meals"] == 2)
    check("telur 2 porsi = 4 butir", abs(s["items"]["telur"]["need"] - 4) < 1e-9, s["items"].get("telur"))
    check("beras ikut dihitung 200 g", abs(s["items"]["beras"]["need"] - 200) < 1e-9)
    check("beras dan minyak dianggap stok", s["items"]["beras"]["stok"] and s["items"]["minyak"]["stok"])
    check("perkiraan bayar = telur + bawang merah + daun bawang + cabai rawit", s["pay"] == 19000 + 10000 + 3000 + 10000, s["pay"])
    check("label slot malam menyebut sisa siang", "Sisa siang" in (await page.text_content('.slot[data-d="0"][data-w="malam"]')))
    check("ringkasan atas menampilkan total", await num(page, "#sTotal") >= 0)
    await page.click("#porsiPlus")
    await page.click("#porsiPlus")
    s = await sh(page)
    check("3 porsi: telur 12 butir = 2 kemasan", s["items"]["telur"]["packs"] == 2, s["items"]["telur"])
    await page.click("#porsiMinus")
    await page.click("#porsiMinus")
    await page.click("#tabBelanja")
    await page.click('.sitem[data-id="telur"] .to-stok')
    s = await sh(page)
    check("tandai 'sudah ada' mengeluarkan telur dari total", s["pay"] == 23000, s["pay"])
    await page.click("#stokBox summary")
    await page.click('#stokList [data-id="beras"] .to-buy')
    s = await sh(page)
    check("beras 'perlu beli' menambah 1 karung 5 kg", s["pay"] == 23000 + 80000, s["pay"])
    await page.click('.sitem[data-id="beras"] .check')
    check("centang keranjang tercatat", "1 dari" in (await page.text_content("#cartPill")))
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_prices_and_copy(b, url):
    print("Harga pribadi dan salin daftar")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 1, "siang", ["tempe_orek", "tumis_kangkung"])
    await page.click("#tabBelanja")
    await page.click('.sitem[data-id="tempe"] .sprice')
    await page.fill(".pe-in", "7500")
    await page.click(".pe-save")
    s = await sh(page)
    check("harga tempe diperbarui dari daftar belanja", s["items"]["tempe"]["cost"] == 7500, s["items"]["tempe"])
    await page.reload()
    await page.wait_for_timeout(250)
    s = await sh(page)
    check("harga pribadi tersimpan setelah dimuat ulang", s["items"]["tempe"]["cost"] == 7500)
    await page.click("#tabHarga")
    meta = await page.text_content('.prow[data-id="tempe"] .prow-meta')
    check("tab Harga menampilkan kenaikan", "naik Rp1.500" in meta, meta)
    await page.fill('.prow[data-id="kangkung"] .p-isi', "2")
    await page.dispatch_event('.prow[data-id="kangkung"] .p-isi', "change")
    await page.fill('.prow[data-id="kangkung"] .p-h', "7000")
    await page.dispatch_event('.prow[data-id="kangkung"] .p-h', "change")
    s = await sh(page)
    check("ubah isi kemasan kangkung menjadi 2 ikat", s["items"]["kangkung"]["packs"] == 1 and s["items"]["kangkung"]["cost"] == 7000, s["items"]["kangkung"])
    await page.click('.prow[data-id="tempe"] .p-reset')
    s = await sh(page)
    check("kembalikan ke harga awal", s["items"]["tempe"]["cost"] == 6000)
    await page.click("#tabBelanja")
    await page.click("#copyList")
    await page.wait_for_timeout(150)
    clip = await page.evaluate("navigator.clipboard.readText()")
    check("daftar disalin dengan judul minggu", clip.startswith("Daftar belanja "), clip[:40])
    check("daftar memuat tempe dan kemasannya", "- Tempe — 1 papan (±300 g)" in clip, clip)
    check("bahan stok tidak ikut disalin", "Garam" not in clip and "Kecap" not in clip)
    check("daftar memuat perkiraan total", "Perkiraan total: Rp" in clip)
    await page.click('.sitem[data-id="tempe"] .sname')
    await page.wait_for_timeout(100)
    check("ketuk nama menyalin kata kunci", await page.evaluate("navigator.clipboard.readText()") == "tempe")
    await page.click("#extraBox summary")
    await page.fill("#extraName", "Galon isi ulang")
    await page.fill("#extraPrice", "20000")
    await page.click("#extraAdd")
    s2 = await sh(page)
    check("barang lain ikut total", s2["pay"] == s["pay"] + 20000, (s["pay"], s2["pay"]))
    # Bahan sendiri dan resep sendiri
    await page.click("#tabHarga")
    await page.fill("#nbName", "Ikan tongkol")
    await page.select_option("#nbKat", "lauk")
    await page.fill("#nbIsi", "500")
    await page.select_option("#nbSat", "g")
    await page.fill("#nbHarga", "22000")
    await page.click("#nbAdd")
    check("bahan sendiri tersimpan", "Ikan tongkol" in (await page.text_content("#priceList")))
    await page.click("#tabResep")
    await page.click("#newResep")
    await page.fill("#edName", "Tongkol balado")
    await page.select_option("#edBahan .ed-row >> nth=0 >> select", label="Ikan tongkol")
    await page.fill("#edBahan .ed-row >> nth=0 >> .ed-q", "125")
    await page.click("#edSave")
    await page.wait_for_timeout(150)
    check("resep sendiri tampil di daftar resep", "Tongkol balado" in (await page.text_content("#recipeList")))
    await page.click("#tabMenu")
    own = await page.evaluate("window.__menuKost.state().resep[0].id")
    await pick(page, 2, "siang", [own])
    s = await sh(page)
    tid = [k for k in s["items"] if k.startswith("own_")]
    check("resep sendiri masuk daftar belanja", tid and abs(s["items"][tid[0]]["need"] - 125) < 1e-9, s["items"])
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_budget(b, url):
    print("Perbandingan dengan amplop Dapur & makan")
    today = datetime.date.today()
    bulan = f"{today.year}-{today.month:02d}"
    data = {"v": 1, "bulan": bulan, "diperbarui": datetime.datetime.now().isoformat(), "nama": "Dapur & makan", "pagu": 1245000, "lain": 0, "belumIsi": False,
            "items": [{"n": "Belanja lauk & sayur", "pagu": 700000, "terpakai": 100000}, {"n": "Beras", "pagu": 120000, "terpakai": 0},
                      {"n": "Bumbu & minyak goreng", "pagu": 80000, "terpakai": 20000}, {"n": "Gas LPG", "pagu": 45000, "terpakai": 0},
                      {"n": "Makan di luar & jajan", "pagu": 300000, "terpakai": 50000}]}
    setup = f"localStorage.setItem('{AMPLOP_KEY}', {json.dumps(json.dumps(data))})"
    ctx, page, errors = await fresh(b, url, setup=setup)
    days = calendar.monthrange(today.year, today.month)[1]
    bg = await page.evaluate("window.__menuKost.budget()")
    check("sumber otomatis dari Amplop Gajian", bg["src"] == "auto", bg.get("src"))
    check("pagu bahan tanpa makan di luar dan gas", bg["pagu"] == 900000, bg.get("pagu"))
    check("terpakai hanya dari rincian bahan", bg["terpakai"] == 120000, bg.get("terpakai"))
    check("jatah per minggu proporsional", bg["jatah"] == round(900000 * 7 / days), (bg.get("jatah"), round(900000 * 7 / days)))
    await page.click("#autoFill")
    await page.click("#tabBelanja")
    txt = await page.text_content("#budgetCard")
    check("kartu anggaran menampilkan jatah", "Jatah belanja per minggu" in txt and "Sisa amplop" in txt)
    ring = await page.text_content("#ringPct")
    check("cincin ringkasan menampilkan persen jatah", ring.endswith("%"), ring)
    await page.click("#budgetCard summary")
    await page.click('#budgetCard .switch[data-n="Gas LPG"]')
    bg = await page.evaluate("window.__menuKost.budget()")
    check("gas dapat dihitung bila diinginkan", bg["pagu"] == 945000, bg.get("pagu"))
    await page.click("#useManual")
    await page.fill("#manualBudget", "800000")
    await page.dispatch_event("#manualBudget", "input")
    bg = await page.evaluate("window.__menuKost.budget()")
    check("anggaran manual dipakai", bg["src"] == "manual" and bg["jatah"] > 0, bg)
    await page.click("#clearManual")
    await page.click("#clearManual")
    bg = await page.evaluate("window.__menuKost.budget()")
    check("anggaran manual dapat dihapus", bg["src"] == "none" and not bg.get("jatah"), bg)
    await page.click("#useAuto")
    await page.click("#budgetCard summary")
    await page.click("#resetHitung")
    bg = await page.evaluate("window.__menuKost.budget()")
    check("pilihan rincian dikembalikan ke bawaan", bg["pagu"] == 900000, bg.get("pagu"))
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_week_tools_and_backup(b, url, tmp):
    print("Isi otomatis, salin minggu, dan cadangan")
    ctx, page, errors = await fresh(b, url)
    await page.click("#autoFill")
    filled = await page.locator(".slot.filled").count()
    check("isi otomatis mengisi 14 slot", filled == 14, filled)
    s = await sh(page)
    check("isi otomatis menghasilkan daftar belanja", s["pay"] > 50000 and s["meals"] == 14, s["pay"])
    await page.click("#nextW")
    await page.click("#copyPrev")
    check("salin minggu lalu ke minggu kosong", await page.locator(".slot.filled").count() == 14)
    await page.click("#clearWeek")
    await page.click("#clearWeek")
    check("kosongkan perlu dua ketukan", await page.locator(".slot.filled").count() == 0)
    await page.click("#prevW")
    async with page.expect_download() as dl:
        await page.click("#bkExport")
    path = tmp / "cadangan.json"
    await (await dl.value).save_as(path)
    data = json.loads(path.read_text())
    check("cadangan berformat menu-kost", data.get("app") == "menu-kost" and data["data"]["minggu"])
    await ctx.close()
    ctx, page, errors = await fresh(b, url)   # perangkat lain: penyimpanan masih kosong
    check("perangkat baru masih kosong", await page.locator(".slot.filled").count() == 0)
    await page.set_input_files("#bkFile", str(path))
    await page.wait_for_timeout(200)
    await page.click("#bkYes")
    await page.wait_for_timeout(200)
    check("cadangan dipulihkan", await page.locator(".slot.filled").count() == 14)
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_carry_over(b, url):
    print("Sisa kemasan antarminggu")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 0, "siang", ["telur_dadar"])
    a = await sh(page)
    check("minggu pertama membeli telur 1 kemasan", a["items"]["telur"]["packs"] == 1)
    await page.click("#nextW")
    await pick(page, 0, "siang", ["telur_dadar"])
    s = await sh(page)
    check("minggu kedua: telur cukup dari sisa 8 butir", s["items"]["telur"]["packs"] == 0 and abs(s["items"]["telur"]["have"] - 8) < 1e-9, s["items"]["telur"])
    check("bawang merah cukup dari sisa", s["items"]["bawang_merah"]["packs"] == 0)
    check("daun bawang tidak awet, tetap dibeli", s["items"]["daun_bawang"]["packs"] == 1)
    check("total minggu kedua hanya daun bawang + cabai", s["pay"] == 3000 + 10000, s["pay"])
    await page.click("#tabBelanja")
    await page.click("#sisaBox summary")
    check("bagian sisa kemasan menampilkan telur", "Telur ayam" in (await page.text_content("#coverList")))
    await page.click('#coverList [data-id="telur"] .set-sisa')
    await page.fill("#coverList .se-in", "0")
    await page.click("#coverList .se-save")
    s = await sh(page)
    check("koreksi sisa 0 membuat telur dibeli lagi", s["items"]["telur"]["packs"] == 1, s["items"]["telur"])
    await page.click('.sitem[data-id="telur"] .set-sisa')
    await page.click(".sitem .se-auto")
    s = await sh(page)
    check("kembali ke hitungan otomatis", s["items"]["telur"]["packs"] == 0)
    await page.click("#nextW")
    await page.click("#nextW")
    await page.click("#tabMenu")
    await pick(page, 0, "siang", ["telur_dadar"])
    s = await sh(page)
    check("minggu kosong memutus rantai sisa", s["items"]["telur"]["packs"] == 1)
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_markup(b, url):
    print("Tambahan harga belanja lewat aplikasi")
    ctx, page, errors = await fresh(b, url, market=False)
    await pick(page, 0, "siang", ["telur_dadar"])
    s = await sh(page)
    check("bawaan: aplikasi +20% (telur 19.000 → 22.800)", s["items"]["telur"]["cost"] == 22800, s["items"]["telur"])
    await page.click("#tabHarga")
    await page.click("#markupPlus")
    s = await sh(page)
    check("tambahan 25% (telur → 23.800)", s["items"]["telur"]["cost"] == 23800, s["items"]["telur"])
    await page.click('#tokoSeg [data-v="pasar"]')
    s = await sh(page)
    check("pasar: tanpa tambahan", s["items"]["telur"]["cost"] == 19000)
    check("pengatur persen disembunyikan untuk pasar", await page.is_hidden("#markupRow"))
    await page.click('#tokoSeg [data-v="online"]')
    await page.fill('.prow[data-id="telur"] .p-h', "27.000")
    await page.dispatch_event('.prow[data-id="telur"] .p-h', "change")
    s = await sh(page)
    check("harga pribadi tidak ditambah persen", s["items"]["telur"]["cost"] == 27000, s["items"]["telur"])
    await page.fill('.prow[data-id="bawang_merah"] .p-isi', "500")
    await page.dispatch_event('.prow[data-id="bawang_merah"] .p-isi', "change")
    s = await sh(page)
    check("ubah kemasan tanpa harga pribadi: harga ikut skala (500 g → 25.000)", s["items"]["bawang_merah"]["cost"] == 25000, s["items"]["bawang_merah"])
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_freshness(b, url):
    print("Kesegaran bahan dan belanja dua kali")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 0, "siang", ["tumis_kangkung"])
    await pick(page, 3, "siang", ["bening_bayam"])
    warn = await page.text_content('.slot[data-d="3"][data-w="siang"]')
    check("tanpa kulkas: bayam hari Kamis diberi peringatan layu", "mungkin sudah layu" in warn and "Bayam" in warn, warn)
    check("saran belanja dua kali muncul", "belanja dua kali" in warn)
    check("kangkung hari Senin tidak diberi peringatan", "layu" not in (await page.text_content('.slot[data-d="0"][data-w="siang"]')))
    await page.click('#tripSet [data-v="2"]')
    warn = await page.text_content('.slot[data-d="3"][data-w="siang"]')
    check("belanja dua kali: peringatan hilang", "layu" not in warn, warn)
    trips = await page.evaluate("Object.fromEntries(window.__menuKost.shopping().buy.map(x => [x.id + '@' + x.trip, x.packs]))")
    check("bayam dibeli pada belanja Kamis", "bayam@1" in trips and "bayam@0" not in trips, trips)
    check("kangkung dibeli pada belanja Senin", "kangkung@0" in trips, trips)
    check("bawang (awet) tetap di belanja Senin", "bawang_merah@0" in trips and "bawang_merah@1" not in trips, trips)
    await page.click("#tabBelanja")
    check("pilihan jadwal belanja tampil", await page.locator("#tripSeg button").count() == 2)
    check("daftar Senin tidak memuat bayam", "Bayam" not in (await page.text_content("#shopList")))
    await page.click('#tripSeg [data-t="1"]')
    check("daftar Kamis memuat bayam", "Bayam" in (await page.text_content("#shopList")))
    await page.click("#copyList")
    await page.wait_for_timeout(150)
    clip = await page.evaluate("navigator.clipboard.readText()")
    check("salin daftar Kamis berjudul hari Kamis", clip.startswith("Daftar belanja Kamis") and "Bayam" in clip and "Kangkung" not in clip, clip[:80])
    await page.click('.sitem[data-id="bayam"] .check')
    st = await page.evaluate("window.__menuKost.state()")
    wk = await page.evaluate("window.__menuKost.week()")
    check("centang keranjang dicatat per jadwal", st["minggu"][wk]["beli"].get("bayam@1") is True, st["minggu"][wk]["beli"])
    await page.click("#tabMenu")
    await page.click('#tripSet [data-v="1"]')
    await page.click('#kulkasSeg [data-v="kulkas"]')
    await pick(page, 2, "malam", ["sayur_sop"])
    warn = await page.text_content('.slot[data-d="2"][data-w="malam"]')
    check("dengan kulkas: sayur sop hari Rabu masih segar", "layu" not in warn, warn)
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_cooking(b, url):
    print("Cara memasak")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 0, "siang", ["telur_dadar", "tumis_kangkung"])
    await pick_opt(page, 0, "malam", "sisa")
    await page.click('.day[data-d="0"] .day-cook')
    body = await page.text_content("#dtBody")
    check("cara masak hari ini memuat kedua menu", "Telur dadar daun bawang" in body and "Tumis kangkung" in body)
    check("porsi termasuk sisa masakan (2 porsi)", "2 porsi" in body, body[:120])
    check("takaran dapur: telur 4 butir", "4 butir" in body)
    check("takaran dapur: bawang merah dalam siung", "siung" in body)
    check("langkah memasak tampil", await page.locator("#dtBody .cook-steps li").count() >= 6)
    await page.click("#dtClose")
    await page.click("#tabResep")
    await page.click('.rcard[data-id="sup_ayam"] .r-cook')
    check("porsi dapat diatur di resep", not await page.is_hidden("#dtPorsiRow"))
    await page.click("#dtPlus")
    body = await page.text_content("#dtBody")
    check("ayam untuk 2 porsi = 200 g", "200 g" in body, body[:200])
    await page.click("#dtClose")
    await page.click('.rcard[data-id="tumis_kangkung"] .r-copy')
    await page.fill("#edSteps", "1. Tumis bawang.\n2. Masukkan kangkung.")
    await page.click("#edSave")
    own = await page.evaluate("window.__menuKost.state().resep.at(-1)")
    check("langkah resep sendiri tersimpan tanpa nomor", own["langkah"] == ["Tumis bawang.", "Masukkan kangkung."], own.get("langkah"))
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def test_nutrition(b, url):
    print("Kadar gizi")
    ctx, page, errors = await fresh(b, url)
    await pick(page, 0, "siang", ["telur_dadar"])
    day = await page.text_content('.day[data-d="0"] .day-gizi')
    check("gizi harian: telur dadar + nasi ±620 kkal", "±620 kkal" in day and "termasuk nasi" in day, day)
    await pick_opt(page, 0, "malam", "sisa")
    day = await page.text_content('.day[data-d="0"] .day-gizi')
    check("sisa masakan ikut dihitung sebagai makan kedua (±1.240 kkal)", "±1.240 kkal" in day, day)
    await page.click('.slot[data-d="0"][data-w="siang"]')
    meta = await page.text_content('#pickList .pitem[data-id="tempe_orek"] small')
    check("pemilih menu menampilkan kalori dan protein", "kkal" in meta and "protein" in meta, meta)
    await page.click("#pickDone")
    await page.click("#tabResep")
    g = await page.text_content('.rcard[data-id="telur_dadar"] .gizi')
    check("kartu resep menampilkan energi, protein, lemak, karbohidrat", all(k in g for k in ["260", "kkal", "13 g", "protein", "lemak", "karbohidrat"]), g)
    await page.click('.rcard[data-id="telur_dadar"] .r-cook')
    check("cara masak menampilkan gizi per porsi", "Gizi per porsi" in (await page.text_content("#dtBody")))
    await page.click("#dtClose")
    await page.click("#tabHarga")
    await page.fill("#nbName", "Jamur tiram")
    await page.fill("#nbIsi", "200")
    await page.fill("#nbHarga", "8000")
    await page.click("#nbAdd")
    await page.click("#tabResep")
    await page.click("#newResep")
    await page.fill("#edName", "Tumis jamur")
    await page.select_option("#edBahan .ed-row >> nth=0 >> select", label="Jamur tiram")
    await page.fill("#edBahan .ed-row >> nth=0 >> .ed-q", "100")
    await page.click("#edSave")
    miss = await page.text_content(".rcard >> nth=0")
    check("bahan sendiri tanpa data gizi diberi keterangan", "tanpa data gizi" in miss, miss)
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def main():
    srv, url = serve()
    tmp = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tests"
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await test_layout(b, url)
        await test_sisa_and_portions(b, url)
        await test_prices_and_copy(b, url)
        await test_budget(b, url)
        await test_carry_over(b, url)
        await test_markup(b, url)
        await test_freshness(b, url)
        await test_cooking(b, url)
        await test_nutrition(b, url)
        await test_week_tools_and_backup(b, url, tmp)
        await b.close()
    srv.shutdown()
    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)} lulus, {len(bad)} gagal")
    sys.exit(1 if bad else 0)


asyncio.run(main())
