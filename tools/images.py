"""Genera versiones ligeras (-800.jpg) de las imágenes para móvil y miniaturas.
Los originales no se tocan. Uso: python3 tools/images.py"""
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)
made = 0
for f in sorted(glob.glob('content/uploads/figma/*/*.jpg') + glob.glob('content/posters/*.jpg')):
    if f.endswith('-800.jpg') or os.path.basename(f) == 'og.jpg':
        continue
    dst = f[:-4] + '-800.jpg'
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(f):
        continue
    im = Image.open(f).convert('RGB')
    if im.size[0] <= 900:
        if os.path.exists(dst):
            os.remove(dst)
        continue
    im.thumbnail((800, 4000), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=80, optimize=True, progressive=True)
    made += 1
print('variantes nuevas:', made)
