#!/usr/bin/env python3
"""Favicons a partir del monograma (content/uploads/monograma/mv_monograma.svg).

Google solo muestra el icono del sitio en los resultados si es cuadrado y mide un
múltiplo de 48 px (48, 96, 192…). Genera, con el azul de la marca de fondo y el
monograma en blanco:

  favicon.svg        vectorial, cuadrado
  favicon-48.png     favicon-96.png     favicon-192.png
  favicon.ico        16 + 32 + 48

Solo necesita Pillow:  python3 tools/icons.py
"""
import re
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'content/uploads/monograma/mv_monograma.svg'
BLUE, WHITE = (6, 0, 255), (255, 255, 255)
MARK = 0.6  # ancho del monograma respecto al lado del icono

svg = SRC.read_text()
rects = []
for m in re.finditer(r'<rect([^>]*)/>', svg):
    a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    x, y, w, h = (float(a[k]) for k in ('x', 'y', 'width', 'height'))
    t = [float(v) for v in re.findall(r'-?[\d.]+', a.get('transform', 'matrix(1 0 0 1 0 0)'))]
    pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    rects.append([(t[0] * px + t[2] * py + t[4], t[1] * px + t[3] * py + t[5]) for px, py in pts])

xs = [p[0] for r in rects for p in r]
ys = [p[1] for r in rects for p in r]
x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
mw, mh = x1 - x0, y1 - y0
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2


def place(side):
    """Polígonos del monograma centrados en un cuadrado de `side`."""
    k = side * MARK / mw
    return [[(side / 2 + (px - cx) * k, side / 2 + (py - cy) * k) for px, py in r] for r in rects]


def raster(size, ss=16):
    big = size * ss
    im = Image.new('RGB', (big, big), BLUE)
    d = ImageDraw.Draw(im)
    for poly in place(big):
        d.polygon(poly, fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)


# SVG cuadrado: fondo azul y el monograma en blanco, centrado
S = 512
polys = place(S)
paths = ''.join('<path d="M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in p) + ' Z"/>' for p in polys)
(ROOT / 'favicon.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}">'
    f'<rect width="{S}" height="{S}" fill="#0600FF"/><g fill="#fff">{paths}</g></svg>\n')

for n in (48, 96, 192):
    raster(n).save(ROOT / f'favicon-{n}.png', optimize=True)

raster(48).save(ROOT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)],
                append_images=[raster(16), raster(32)])
print('favicon.svg, favicon-48/96/192.png, favicon.ico (16/32/48)')
