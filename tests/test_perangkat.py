"""Tes perangkat: emulasi ponsel, pemasangan (PWA), dan penggunaan tanpa internet.

Menyajikan aplikasi dari http://localhost agar service worker dapat aktif, lalu memeriksa:
- alur utama dengan sentuhan pada ukuran layar Android dan iPhone (mesin Chromium);
- kelayakan pemasangan menurut Chrome (Page.getInstallabilityErrors);
- ukuran ikon sesuai manifest;
- aplikasi tetap terbuka dan data tetap ada saat luring.

Jalankan dari folder repositori:  python tests/test_perangkat.py
"""
import asyncio
import functools
import http.server
import json
import pathlib
import struct
import sys
import threading

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK   " if cond else "  GAGAL") + "  " + name + (("  — " + str(detail)) if detail and not cond else ""))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://localhost:{srv.server_address[1]}/"


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    return struct.unpack(">II", head[16:24])


def test_manifest():
    print("Manifest dan ikon")
    m = json.loads((ROOT / "manifest.webmanifest").read_text())
    check("manifest berbahasa Indonesia dan standalone", m.get("lang") == "id" and m.get("display") == "standalone")
    for ic in m["icons"]:
        p = ROOT / ic["src"]
        w, h = png_size(p) if p.exists() else (0, 0)
        check(f"ikon {ic['src']} sesuai ukuran {ic['sizes']}", f"{w}x{h}" == ic["sizes"], (w, h))
    check("ada ikon maskable", any(i.get("purpose") == "maskable" for i in m["icons"]))
    html = (ROOT / "index.html").read_text()
    check("ikon layar utama iPhone tersedia", (ROOT / "icons/apple-touch-icon.png").exists() and "apple-touch-icon" in html)
    sw = (ROOT / "sw.js").read_text()
    missing = [f for f in ["index.html", "styles.css", "data.js", "app.js", "privasi.html"] if f"./{f}" not in sw]
    check("service worker menyimpan semua berkas inti", not missing, missing)


async def flow_on(b, url, name, **device):
    print(f"Alur sentuh — {name}")
    ctx = await b.new_context(**device, permissions=["clipboard-read", "clipboard-write"])
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    await page.goto(url)
    await page.wait_for_timeout(300)
    await page.tap("#autoFill")
    check("isi otomatis lewat ketukan", await page.locator(".slot.filled").count() == 14)
    await page.tap('.slot[data-d="2"][data-w="siang"]')
    await page.wait_for_timeout(300)
    check("lembar pemilih menu terbuka", await page.evaluate("document.querySelector('#pick').open"))
    box = await page.evaluate("(() => { const r = document.querySelector('#pick').getBoundingClientRect(); return [r.top, r.bottom, innerHeight]; })()")
    check("lembar pemilih menempel di bawah layar", abs(box[1] - box[2]) < 2, box)
    await page.tap("#pickDone")
    await page.tap("#tabBelanja")
    await page.wait_for_timeout(200)
    wide = await page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    check("tidak menggulir ke samping", not wide)
    small = await page.evaluate("""[...document.querySelectorAll('#panelBelanja button:not([hidden]), .tabs button')]
      .filter(b => b.offsetParent && !b.classList.contains('link') && !b.classList.contains('sname'))
      .map(b => b.getBoundingClientRect()).filter(r => r.height < 28 || r.width < 28).length""")
    check("tombol utama cukup besar untuk jari (≥28 px)", small == 0, small)
    await page.tap(".sitem .check >> nth=0")
    check("centang keranjang dengan ketukan", "1 dari" in (await page.text_content("#cartPill")))
    await page.tap("#copyList")
    await page.wait_for_timeout(150)
    clip = await page.evaluate("navigator.clipboard.readText()")
    check("salin daftar belanja", clip.startswith("Daftar belanja"))
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def pwa_offline(b, url):
    print("Pemasangan dan mode luring")
    ctx = await b.new_context(viewport={"width": 390, "height": 844})
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    await page.goto(url)
    await page.evaluate("navigator.serviceWorker.ready")
    await page.reload()
    await page.wait_for_timeout(500)
    check("service worker aktif", await page.evaluate("!!navigator.serviceWorker.controller"))
    cdp = await ctx.new_cdp_session(page)
    inst = await cdp.send("Page.getInstallabilityErrors")
    errs = [e["errorId"] for e in inst.get("installabilityErrors", [])]
    check("Chrome menilai aplikasi dapat dipasang", not errs, errs)
    await page.click("#autoFill")
    await page.wait_for_timeout(400)
    cached = await page.evaluate("caches.open('menu-kost-v1').then(c => c.keys()).then(k => k.map(r => new URL(r.url).pathname))")
    check("berkas inti tersimpan di cache", all(any(p.endswith(f) for p in cached) for f in ["/index.html", "/app.js", "/data.js", "/styles.css"]), cached)
    await ctx.set_offline(True)
    await page.reload()
    await page.wait_for_timeout(500)
    check("aplikasi terbuka saat luring", await page.locator(".day").count() == 7)
    check("menu tersimpan tetap ada saat luring", await page.locator(".slot.filled").count() == 14)
    fonts = await page.evaluate("document.fonts.check('16px \"Bricolage Grotesque\"')")
    check("huruf tetap termuat saat luring", fonts)
    await page.click("#tabBelanja")
    check("daftar belanja dapat dibuka saat luring", await page.locator(".sitem").count() > 5)
    check("tanpa galat skrip", not errors, errors)
    await ctx.close()


async def main():
    test_manifest()
    srv, url = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await flow_on(b, url, "Android (Pixel 7)", **p.devices["Pixel 7"])
        iphone = dict(p.devices["iPhone 13"])
        iphone.pop("default_browser_type", None)
        await flow_on(b, url, "ukuran iPhone 13 (mesin Chromium)", **iphone)
        await pwa_offline(b, url)
        await b.close()
    srv.shutdown()
    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)} lulus, {len(bad)} gagal")
    sys.exit(1 if bad else 0)


asyncio.run(main())
