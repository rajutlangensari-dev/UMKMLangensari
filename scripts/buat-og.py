"""Bikin gambar pratinjau tautan (Open Graph) untuk Rajut Langensari.

Jalankan ulang kalau nama merek atau paletnya berubah:
    python "S:\\Code\\Main Workflow\\KKN\\Katalog-Dev\\scripts\\buat-og.py"

Keluaran: app/opengraph-image.png. Next.js otomatis memakai berkas dengan nama
itu, tidak perlu didaftarkan di metadata.

Dibuat sebagai PNG statis, bukan lewat next/og, supaya tidak menambah paket dan
tidak perlu dirender ulang tiap permintaan. Isinya tidak pernah berubah.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

LEBAR, TINGGI = 1200, 630
OLIVE = (101, 107, 55)
OAT = (242, 240, 226)
BRICK = (180, 71, 44)

KELUAR = Path(__file__).resolve().parent.parent / "app" / "opengraph-image.png"


def font(ukuran: int, tebal: bool = True) -> ImageFont.FreeTypeFont:
    for nama in (("arialbd.ttf", "segoeuib.ttf") if tebal else ("arial.ttf", "segoeui.ttf")):
        jalur = Path(r"C:\Windows\Fonts") / nama
        if jalur.exists():
            return ImageFont.truetype(str(jalur), ukuran)
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (LEBAR, TINGGI), OLIVE)
    d = ImageDraw.Draw(img)

    # Mark rantai rajut, sama seperti wordmark di header.
    y, rx, ry, tebal = 132, 46, 38, 11
    for i in range(3):
        cx = 92 + i * 56
        d.ellipse([cx - rx, y - ry, cx + rx, y + ry], outline=OAT, width=tebal)

    d.text((88, 196), "Rajut", font=font(150), fill=OAT)
    d.text((88, 332), "Langensari", font=font(150), fill=OAT)

    # Garis brick sebagai pemisah, aksen tunggal yang sama dengan situsnya.
    d.rectangle([88, 512, 232, 521], fill=BRICK)
    d.text((88, 546), "Katalog produk buatan perajin Desa Langensari", font=font(30, False), fill=OAT)

    KELUAR.parent.mkdir(parents=True, exist_ok=True)
    img.save(KELUAR)
    print(f"tersimpan: {KELUAR}  ({LEBAR}x{TINGGI})")


if __name__ == "__main__":
    main()
