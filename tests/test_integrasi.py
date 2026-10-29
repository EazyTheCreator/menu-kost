"""Tes keterhubungan Menu Masak Mingguan dengan Amplop Gajian.

Memerlukan salinan repositori amplop-gajian di folder yang bersebelahan:

    induk/
      amplop-gajian/
      menu-kost/

Keduanya disajikan dari satu server lokal (origin yang sama), seperti di GitHub Pages.
Jalankan dari folder repositori menu-kost:  python tests/test_integrasi.py
"""
import asyncio
import functools
import http.server
import json
import pathlib
import sys
import threading

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK   " if cond else "  GAGAL") + "  " + name + (("  — " + str(detail)) if detail and not cond else ""))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(PARENT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}"


async def run(engine, base):
    print(f"Alur lengkap ({engine.name})")
    b = await engine.launch()
    ctx = await b.new_context(viewport={"width": 390, "height": 844})
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    await page.goto(base + "/amplop-gajian/index.html")
    await page.wait_for_timeout(300)
    await page.fill("#inGaji", "5000000")
    await page.dispatch_event("#inGaji", "input")
    await page.wait_for_timeout(700)
    share = json.loads(await page.evaluate("localStorage.getItem('amplop-gajian-dapur')"))
    check("Amplop Gajian membagikan ringkasan dapur", share["v"] == 1 and share["pagu"] > 0)

    await page.goto(base + "/menu-kost/index.html")
    await page.wait_for_timeout(300)
    await page.click("#autoFill")
    await page.wait_for_selector("#autoFill:not([disabled])")
    await page.click("#tabBelanja")
    await page.wait_for_timeout(200)
    bg = await page.evaluate("window.__menuKost.budget()")
    check("Menu Masak membaca amplop secara otomatis", bg["src"] == "auto" and bg["terpakai"] == 0, bg.get("src"))
    await page.fill("#paidIn", "150000")
    await page.dispatch_event("#paidIn", "input")
    await page.click("#toAmplop")
    await page.wait_for_url("**/amplop-gajian/**")
    await page.wait_for_timeout(500)
    check("Amplop Gajian terbuka di tab Catat", await page.get_attribute("#tabCatat", "aria-selected") == "true")
    check("nominal terisi", (await page.input_value("#txAmt")) == "150.000")
    check("keterangan terisi", "Belanja mingguan" in (await page.input_value("#txDesc")))
    check("amplop Dapur & makan terpilih", (await page.input_value("#txPos")).startswith("k2|k2a"), await page.input_value("#txPos"))
    check("alamat dibersihkan dari isian", "#catat" not in page.url)
    pre = json.loads(await page.evaluate("localStorage.getItem('amplop-gajian-menu') || '{\"catatan\":[]}'"))
    check("belum dicatat tanpa ketukan pengguna", not pre["catatan"], pre)
    await page.click("#txSubmit")
    await page.wait_for_timeout(700)
    conf = json.loads(await page.evaluate("localStorage.getItem('amplop-gajian-menu') || '{}'"))
    check("catatan tertaut ke minggu di Menu Masak", any(x.get("amt") == 150000 and x.get("ref") for x in conf.get("catatan", [])), conf)

    await page.goto(base + "/menu-kost/index.html")
    await page.wait_for_timeout(300)
    await page.click("#tabBelanja")
    await page.wait_for_timeout(300)
    status = await page.text_content("#doneStatus")
    check("Menu Masak menampilkan sudah dicatat", "Sudah dicatat" in status and "150.000" in status, status)
    bg = await page.evaluate("window.__menuKost.budget()")
    check("terpakai di amplop bertambah 150.000", bg["terpakai"] == 150000, bg.get("terpakai"))
    card = await page.text_content("#budgetCard")
    check("belanja yang sudah dicatat tidak dikurangkan dua kali", "termasuk belanja minggu ini" in card)

    await page.click("#toAmplop")
    check("pencatatan ulang meminta konfirmasi", "Ketuk lagi" in (await page.text_content("#toAmplop")))
    await page.click("#toAmplop")
    await page.wait_for_url("**/amplop-gajian/**")
    await page.wait_for_timeout(500)
    check("Amplop Gajian memperingatkan pencatatan ganda", "sudah dicatat" in (await page.text_content("#txMsg")))

    # Salah catat: hapus catatan di Amplop Gajian, Menu Masak harus ikut kembali ke "belum dicatat".
    await page.click("#txList .tx .pdel")
    await page.click("#txList .tx .pdel")
    await page.wait_for_timeout(800)
    await page.goto(base + "/menu-kost/index.html")
    await page.wait_for_timeout(300)
    await page.click("#tabBelanja")
    await page.wait_for_timeout(200)
    status = await page.text_content("#doneStatus")
    check("setelah dihapus di Amplop Gajian, status kembali belum dicatat", "Belum dicatat" in status, status)
    bg = await page.evaluate("window.__menuKost.budget()")
    check("terpakai di amplop kembali 0", bg["terpakai"] == 0, bg.get("terpakai"))

    # Total dibayar dapat dikembalikan ke perkiraan.
    await page.fill("#paidIn", "99000")
    await page.dispatch_event("#paidIn", "input")
    check("tombol kembalikan ke perkiraan muncul", not await page.is_hidden("#paidReset"))
    await page.click("#paidReset")
    est = await page.evaluate("window.__menuKost.shopping().pay")
    check("total dibayar kembali ke perkiraan", (await page.input_value("#paidIn")).replace(".", "") == str(est))

    # Catat lagi, lalu buka Amplop Gajian lewat tautan ubah/hapus.
    await page.click("#toAmplop")
    await page.wait_for_url("**/amplop-gajian/**")
    await page.wait_for_timeout(500)
    await page.click("#txSubmit")
    await page.wait_for_timeout(800)
    await page.goto(base + "/menu-kost/index.html")
    await page.wait_for_timeout(300)
    await page.click("#tabBelanja")
    await page.click("#fixRecord")
    await page.wait_for_url("**/amplop-gajian/**")
    await page.wait_for_timeout(500)
    check("tautan ubah/hapus membuka riwayat di Amplop Gajian", await page.get_attribute("#tabCatat", "aria-selected") == "true" and "Riwayat" in (await page.text_content("#txMsg")))
    check("tanpa galat skrip", not errors, errors)
    await b.close()


async def main():
    if not (PARENT / "amplop-gajian" / "index.html").exists():
        print("Lewati: folder amplop-gajian tidak ditemukan di samping menu-kost.")
        return
    srv, base = serve()
    async with async_playwright() as p:
        for engine in (p.chromium, p.webkit):
            try:
                await run(engine, base)
            except Exception as e:  # WebKit mungkin belum terpasang
                if engine is p.webkit and "Executable doesn't exist" in str(e):
                    print("  (WebKit belum terpasang; jalankan: python -m playwright install webkit)")
                else:
                    raise
    srv.shutdown()
    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)} lulus, {len(bad)} gagal")
    sys.exit(1 if bad else 0)


asyncio.run(main())
