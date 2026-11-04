"""Prepara las imágenes para la web:
  - foto.avif        AVIF a tamaño completo (~60-70 % menos que el JPG, sin pérdida visible)
  - foto-800.avif    AVIF de 800 px para móvil y miniaturas
  - foto-800.jpg     respaldo JPG de 800 px (navegadores sin AVIF)
  - Los fotogramas de portada (content/posters) se limitan a 1280 px de lado largo.
Los originales de content/uploads/2024 no se tocan. Solo procesa lo que falta o ha cambiado.
Uso: python3 tools/images.py"""
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)
POSTER_MAX = 1280


def stale(dst, src):
    return not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src)


made = saved = 0
files = sorted(glob.glob('content/uploads/figma/*/*.jpg') + glob.glob('content/posters/*.jpg'))
for f in files:
    if f.endswith('-800.jpg') or os.path.basename(f) == 'og.jpg':
        continue
    im = Image.open(f).convert('RGB')
    if f.startswith('content/posters/') and max(im.size) > POSTER_MAX:
        before = os.path.getsize(f)
        im.thumbnail((POSTER_MAX, POSTER_MAX), Image.LANCZOS)
        im.save(f, 'JPEG', quality=80, optimize=True, progressive=True)
        saved += before - os.path.getsize(f)
    base = f[:-4]
    if stale(base + '.avif', f):
        im.save(base + '.avif', 'AVIF', quality=52, speed=6); made += 1
    if im.size[0] > 900:
        small = im.copy(); small.thumbnail((800, 4000), Image.LANCZOS)
        if stale(base + '-800.jpg', f):
            small.save(base + '-800.jpg', 'JPEG', quality=78, optimize=True, progressive=True); made += 1
        if stale(base + '-800.avif', f):
            small.save(base + '-800.avif', 'AVIF', quality=50, speed=6); made += 1
    else:
        for x in (base + '-800.jpg', base + '-800.avif'):
            if os.path.exists(x):
                os.remove(x)

jpg = sum(os.path.getsize(f) for f in files if os.path.exists(f) and not f.endswith('og.jpg') and not f.endswith('-800.jpg'))
avif = sum(os.path.getsize(f) for f in glob.glob('content/uploads/figma/*/*.avif') + glob.glob('content/posters/*.avif'))
print(f'archivos nuevos: {made} · ahorro en portadas: {saved // 1024} KB')
print(f'JPG: {jpg / 1048576:.1f} MB  ->  AVIF: {avif / 1048576:.1f} MB')
