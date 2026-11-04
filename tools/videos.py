"""Prepara los vídeos para la web en tres codecs, de más ligero a más compatible:

  AV1  (.av1.mp4)   ~1/3 del peso de H.264 · Chrome, Firefox, Edge, Apple con chip reciente
  HEVC (.hevc.mp4)  ~1/2 del peso de H.264 · Safari en iPhone, iPad y Mac
  H.264 (.mp4)      respaldo universal

El navegador elige el primero que puede reproducir. Los originales no se tocan.
Escribe content/media/manifest.json, que usa tools/build.mjs.

Uso: python3 tools/videos.py        (solo codifica lo que falta o ha cambiado)
"""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
U, FV, OUT = 'content/uploads/2024', 'content/uploads/figma-video', 'content/media'

# (original, nombre web, ancho máximo, crf H.264, usar el original como H.264)
# Ajustes para vídeos con mucho grano o textura: el grano se resintetiza en AV1 en vez de codificarlo
TUNE = {
    'leo-rizzi': {'hevc_crf': 33, 'av1_crf': 46, 'grain': 14},
    'vintage-palace': {'hevc_crf': 32, 'av1_crf': 46, 'grain': 8},
}
VIDEOS = [
    (f'{U}/404/404_portada_desktop.mp4', '404-studio', 1920, 25, False),
    (f'{U}/404/404_portada_movile.mp4', '404-studio-movil', 1080, 25, False),
    (f'{U}/claur/ct-video-inicial.mp4', 'claur-tiles', 1080, 25, False),
    (f'{U}/leo-rizzi/storie_2_leorizzi_1.mp4', 'leo-rizzi', 720, 31, False),
    (f'{U}/zelandia/zelandia_animación_desktop.mp4', 'zelandia-walk', 1920, 25, False),
    (f'{U}/zelandia/zelandia_animación_acortada.mp4', 'zelandia-walk-movil', 1080, 25, False),
    (f'{U}/way/inflable amorfo FINAL HORIZONTAL_1.mp4', 'way', 1920, 25, False),
    (f'{U}/way/inflable amorfo FINAL VERTICAL_1.mp4', 'way-movil', 1080, 25, False),
    (f'{U}/tot/sun&snow/S&S_MOBILE_ANIMACION STORIES.mp4', 'sun-and-snow', 1080, 25, False),
    (f'{U}/tot/delta/delta_video_home.mp4', 'delta', 720, 28, False),
    (f'{U}/tot/ponteveccio/PONTEVECCIO_WEB_LOGO_OPTIMIZADO.mp4', 'pontevecchio', 1920, 25, False),
    (f'{U}/tot/ponteveccio/PONTEVECCIO_MOBILE_LOGO_OPTIMIZADO.mp4', 'pontevecchio-movil', 1080, 25, False),
    (f'{FV}/vintage-palace/01.mp4', 'vintage-palace', 720, 28, False),
    # Vídeos de la galería del deck: su H.264 es el propio archivo subido
    (f'{FV}/404-studio/02.mp4', 'g-404-studio-02', 1080, 0, True),
    (f'{FV}/dmatinada/01.mp4', 'g-dmatinada-01', 1080, 0, True),
    (f'{FV}/orbis-vacui/09.mp4', 'g-orbis-vacui-09', 1080, 0, True),
    (f'{FV}/bernal/03.mp4', 'g-bernal-03', 1080, 0, True),
    (f'{FV}/bernal/04.mp4', 'g-bernal-04', 1080, 0, True),
    (f'{FV}/bernal-vida-y-milagros/portada.mp4', 'g-bernal-vida-y-milagros', 1080, 0, True),
]
# Si se suben los vídeos que faltan del deck, se añaden solos
for rel, name in [('404-studio/06.mp4', 'g-404-studio-06'), ('claur-tiles/15.mp4', 'g-claur-tiles-15'), ('orbis-vacui/11.mp4', 'g-orbis-vacui-11')]:
    if os.path.exists(f'{FV}/{rel}'):
        VIDEOS.append((f'{FV}/{rel}', name, 1920, 0, True))


def fresh(dst, src):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)


def ff(src, dst, w, codec_args):
    vf = f"scale='min({w},iw)':-2:flags=lanczos,fps='min(30,source_fps)'"
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src, '-an', '-vf', vf, *codec_args, '-movflags', '+faststart', dst]
    subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL if 'libsvtav1' in codec_args else None)


def kb(p):
    return f'{os.path.getsize(p) / 1024:,.0f} KB'.replace(',', '.')


OLD = {}
if os.path.exists(f'{OUT}/manifest.json'):
    OLD = json.load(open(f'{OUT}/manifest.json'))
skip = OLD.get('_descartados', {})   # variantes que no compensaban: no se vuelven a codificar
manifest, rejected = {}, {}
os.makedirs(OUT, exist_ok=True)
for src, name, w, crf, keep in VIDEOS:
    if not os.path.exists(src):
        print('falta', src); continue
    h264 = src if keep else f'{OUT}/{name}.mp4'
    hevc, av1 = f'{OUT}/{name}.hevc.mp4', f'{OUT}/{name}.av1.mp4'
    stamp = os.path.getmtime(src)
    if not keep and not fresh(h264, src):
        ff(src, h264, w, ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p'])
        if os.path.getsize(h264) > os.path.getsize(src):  # grano: mejor el original sin audio
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-an', '-c:v', 'copy', '-movflags', '+faststart', h264], check=True)
    t = TUNE.get(name, {})
    if not fresh(hevc, src) and skip.get(hevc) != stamp:
        ff(src, hevc, w, ['-c:v', 'libx265', '-preset', 'medium', '-crf', str(t.get('hevc_crf', 28)), '-tag:v', 'hvc1', '-pix_fmt', 'yuv420p', '-x265-params', 'log-level=error'])
    if not fresh(av1, src) and skip.get(av1) != stamp:
        extra = ['-svtav1-params', f"film-grain={t['grain']}:film-grain-denoise=1"] if t.get('grain') else []
        ff(src, av1, w, ['-c:v', 'libsvtav1', '-preset', '6', '-crf', str(t.get('av1_crf', 40)), '-g', '150', '-pix_fmt', 'yuv420p10le', *extra])
    # Cada variante se ofrece solo si pesa al menos un 5 % menos que H.264; si no, se borra
    base = os.path.getsize(h264)
    entry, sizes = {'h264': h264}, {'h264': base}
    for k, f in (('hevc', hevc), ('av1', av1)):
        if os.path.exists(f) and os.path.getsize(f) < base * 0.95:
            entry[k] = f; sizes[k] = os.path.getsize(f)
        elif os.path.exists(f):
            os.remove(f); rejected[f] = stamp
        elif skip.get(f) == stamp:
            rejected[f] = stamp
    entry['bytes'] = sizes
    manifest[h264] = entry
    print(f"{name:28} h264 {kb(h264):>9}  hevc {kb(hevc) if 'hevc' in entry else '—':>9}  av1 {kb(av1) if 'av1' in entry else '—':>9}")
    sys.stdout.flush()

manifest['_descartados'] = rejected
with open(f'{OUT}/manifest.json', 'w') as f:
    json.dump(manifest, f, indent=1, ensure_ascii=False)
print('manifest:', len(manifest) - 1, 'vídeos')
