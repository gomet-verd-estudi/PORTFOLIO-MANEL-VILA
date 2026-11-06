"""Vídeos ligeros para las miniaturas del índice (modo grid).

Cada miniatura es una ventana 4:5 que reproduce el vídeo de portada del proyecto. Con el vídeo
completo (720p–1080p) el móvil decodifica varios a la vez y el índice da tirones. Aquí se hace una
versión pequeña por proyecto: ya recortada a 4:5 (lo que se ve en la miniatura), 640×800, H.264
(lo decodifica el chip de cualquier móvil, sin cargar el procesador), sin audio, preparada para
empezar a verse mientras se descarga.

Uso: python3 tools/tiles.py   (solo codifica lo que falta o ha cambiado). Escribe content/media/tiles/<slug>.mp4
Necesita ffmpeg con libx264. tools/build.mjs los usa si existen.
"""
import os, re, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
OUT = 'content/media/tiles'
os.makedirs(OUT, exist_ok=True)

# Vídeo que muestra cada miniatura: la versión vertical si existe (las miniaturas son verticales)
src = open('assets/js/projects.js', encoding='utf8').read()
consts = dict(re.findall(r"const (\w+) = '([^']*)';", src))
def resolve(expr):
    return ''.join(consts.get(t.strip(), t.strip().strip("'")) for t in expr.split('+'))

jobs = []
for block in re.split(r"\n  \{\n", src)[1:]:
    slug = re.search(r"slug: '([^']+)'", block)
    media = re.search(r"media: \{([^}]*)\}", block)
    if not slug or not media or "type: 'video'" not in media.group(1):
        continue
    mob = re.search(r"mobile: ([^,]+),", media.group(1))
    main = re.search(r"src: ([^,]+),", media.group(1))
    path = resolve((mob or main).group(1))
    jobs.append((slug.group(1), path))

for slug, path in jobs:
    out = f'{OUT}/{slug}.mp4'
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(path):
        print('ok   ', out); continue
    # Un poco de limpieza de grano (en una miniatura no se aprecia y es lo que más pesa) y techo de bitrate
    vf = 'scale=640:800:force_original_aspect_ratio=increase,crop=640:800,fps=30,hqdn3d=2:1.5:4:3'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-vf', vf, '-an',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-maxrate', '900k', '-bufsize', '1800k',
           '-profile:v', 'main', '-level', '3.1',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
    subprocess.run(cmd, check=True)
    print('hecho', out, f'{os.path.getsize(out) / 1e6:.2f} MB')
