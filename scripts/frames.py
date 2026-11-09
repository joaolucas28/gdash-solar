# Extrai frames sem ffmpeg (PyAV). Uso, de dentro da pasta do anúncio: python -I ../../scripts/frames.py <video>.mp4 frames
# Extrai frames com PyAV (sem ffmpeg): a cada 0,25s nos 3 primeiros segundos, a cada 2s depois. Monta contact sheets.
import av, sys, os
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
c = av.open(src); s = c.streams.video[0]
dur = float(c.duration / av.time_base)
alvos = [round(i * 0.25, 2) for i in range(12)] + [float(t) for t in range(4, int(dur) + 1, 2)]
got = {}; i = 0
for f in c.decode(s):
    t = float(f.pts * s.time_base)
    while i < len(alvos) and t >= alvos[i]:
        im = f.to_image(); im.thumbnail((360, 640)); got[alvos[i]] = im; im.save(f"{out}/f_{alvos[i]:06.2f}.jpg", quality=80); i += 1
    if i >= len(alvos): break
print('duracao', round(dur, 1), 'frames', len(got), 'tamanho', s.width, s.height)
def sheet(ts, name, cols):
    ims = [got[t] for t in ts if t in got]; w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * w, rows * (h + 22)), 'white'); d = ImageDraw.Draw(sh)
    for k, (t, im) in enumerate(zip([t for t in ts if t in got], ims)):
        x, y = (k % cols) * w, (k // cols) * (h + 22); sh.paste(im, (x, y + 22)); d.text((x + 6, y + 4), f"{t:.2f}s", fill='black')
    sh.save(f"{out}/{name}.png")
sheet(alvos[:12], 'sheet_hook', 6); sheet(alvos[12:], 'sheet_resto', 7)
