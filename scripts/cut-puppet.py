"""Cut Maryam's full-body illustration into the puppet layers used by components/Puppet.tsx.

Usage:  python3 scripts/cut-puppet.py art-src/maryam-full.webp public/art/puppet
Needs Pillow and numpy. The coordinates below are tuned to art-src/maryam-full.webp
(1024 x 1536); if the drawing changes, the joint positions printed at the end must be
copied into the J table in components/Puppet.tsx.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
import os
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert("RGB")
W, H = im.size
a = np.asarray(im).astype(np.int16)
R, G, B = a[..., 0], a[..., 1], a[..., 2]

# ── background: flood fill from the border with a colour-distance test ──
bg = np.array([247, 238, 246])
near = (np.abs(a - bg).sum(-1) < 26)
from collections import deque
seen = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y+dy, x+dx
        if 0 <= ny < H and 0 <= nx < W and near[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
alpha = (~seen).astype(np.uint8) * 255
alpha = np.asarray(Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9)))
body = alpha > 8

yy, xx = np.mgrid[0:H, 0:W]
lum = 0.3 * R + 0.59 * G + 0.11 * B
dark = lum < 80
blue = (B > R + 12)

def boundary(pts, y):
    ys = [p[1] for p in pts]; xs = [p[0] for p in pts]
    return np.interp(y, ys, xs)
Lb = boundary([(400, 380), (398, 520), (392, 600), (380, 690), (368, 760), (362, 920)], yy)
Rb = boundary([(620, 380), (622, 520), (628, 600), (640, 690), (652, 760), (658, 920)], yy)

scarf = body & dark & (yy >= 338) & (yy < 715) & (xx > 330) & (xx < 690)
tail = scarf & (yy >= 452) & (xx < 518)
wrap = scarf & ~tail
armL = body & ~dark & ~blue & (yy > 380) & (yy < 915) & (xx < Lb)
armR = body & ~dark & ~blue & (yy > 380) & (yy < 915) & (xx > Rb)
bgdist = np.abs(a - bg).sum(-1)
# shoes are warm white; the backdrop and floor shadow are neutral lavender
shoe = np.zeros((H, W), bool)
for (x0, x1) in ((350, 492), (518, 652)):
    warm = ((R - B) >= 9) & (yy > 1378) & (yy < 1490) & (xx >= x0) & (xx < x1) & ~blue
    warm = np.asarray(Image.fromarray((warm * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))) > 0
    for y in range(1378, 1490):
        xs = np.where(warm[y])[0]
        if len(xs) > 4: shoe[y, xs.min():xs.max() + 1] = True
sa = np.asarray(Image.fromarray((shoe * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9)))
alpha = np.where((yy > 1378) & (yy < 1490) & ~blue, sa, alpha)
body = alpha > 8
legs = body & (yy > 700) & (blue | shoe) & ~armL & ~armR
legL = legs & (xx < 504)
legR = legs & (xx >= 504)
head = body & (yy < 372) & ~scarf
head |= body & (yy < 352)
torso = body & (yy >= 360) & (yy < 800) & ~scarf & ~armL & ~armR & ~legs & ~head & ~(blue & (yy > 720))

rgb = np.asarray(im).copy()
# fill the shirt behind the hanging scarf end (row-wise blend between the shirt on either side)
fill = tail | (wrap & (yy > 430))
for y in range(430, 716):
    xs = np.where(fill[y])[0]
    if len(xs) == 0: continue
    l, r = xs.min() - 3, xs.max() + 3
    while l > 0 and not (body[y, l] and not dark[y, l]): l -= 1
    while r < W - 1 and not (body[y, r] and not dark[y, r]): r += 1
    cl, cr = rgb[y, l].astype(float), rgb[y, r].astype(float)
    for x in xs:
        t = (x - l) / max(1, r - l)
        rgb[y, x] = (cl * (1 - t) + cr * t).astype(np.uint8)
torso_full = torso | (fill & (yy > 430))
# a strip of sleeve along each armpit seam, so a swinging arm never opens a gap
seamband = body & ~dark & ~blue & (yy > 420) & (yy < 780) & (((xx >= Lb - 16) & (xx < Lb)) | ((xx > Rb) & (xx <= Rb + 16)))
torso_full = torso_full | seamband
orig = np.asarray(im)
def layer(mask, extra=None):
    A = np.where(mask, alpha, 0).astype(np.uint8)
    img = np.dstack([np.where((scarf | head)[..., None], orig, rgb), A])
    return Image.fromarray(img, "RGBA")

# jeans continue up under the shirt so a lifted leg never shows a gap
def leg_layer(mask, x0, x1):
    img = layer(mask)
    d = ImageDraw.Draw(img)
    col = tuple(int(c) for c in rgb[800, (x0 + x1) // 2]) + (255,)
    d.rectangle([x0 + 6, 690, x1 - 6, 790], fill=col)
    return img

# closed eyes for blinking: skin painted over each eye, then a soft lash curve
def blink_layer():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    src_rgba = layer(head)
    for (x0, x1, cx, side) in ((412, 488, 462, -1), (538, 614, 570, 1)):
        y0, y1 = 196, 252
        patch = Image.new("RGBA", (x1 - x0, y1 - y0))
        for x in range(x0, x1):
            top = rgb[y0 - 4, x].astype(float); bot = rgb[y1 + 6, x].astype(float)
            for y in range(y0, y1):
                t = (y - y0) / (y1 - y0)
                c = top * (1 - t) + bot * t
                patch.putpixel((x - x0, y - y0), tuple(int(v) for v in c) + (255,))
        m = Image.new("L", patch.size, 0)
        ImageDraw.Draw(m).ellipse([2, 2, patch.size[0] - 3, patch.size[1] - 3], fill=255)
        m = m.filter(ImageFilter.GaussianBlur(2.5))
        img.paste(patch, (x0, y0), m)
        d = ImageDraw.Draw(img)
        pts = [(cx - 30 + i, 226 + 9 * (1 - ((i - 30) / 30) ** 2)) for i in range(0, 61, 3)]
        d.line(pts, fill=(38, 28, 28, 255), width=5, joint="curve")
        ox = cx + 30 * (-side if False else (1 if side > 0 else -1))
        d.line([(ox, 226), (ox + 9 * (1 if side > 0 else -1), 219)], fill=(38, 28, 28, 255), width=4)
    return img

layers = {
    "legL": leg_layer(legL, 372, 504), "legR": leg_layer(legR, 504, 640),
    "torso": layer(torso_full), "armL": layer(armL), "armR": layer(armR),
    "head": layer(head), "blink": blink_layer(), "wrap": layer(wrap), "tail": layer(tail),
}
# shared crop + scale so every layer stacks perfectly
X0, Y0, X1, Y1 = 260, 24, 760, 1488
scale = 1000 / (Y1 - Y0)
size = (round((X1 - X0) * scale), 1000)
for name, img in layers.items():
    img.crop((X0, Y0, X1, Y1)).resize(size, Image.LANCZOS).save(f"{out}/{name}.webp", "WEBP", quality=88, method=6)
print("size", size)
def pct(x, y): return round((x - X0) / (X1 - X0) * 100, 2), round((y - Y0) / (Y1 - Y0) * 100, 2)
for n, p in {"hipL": (440, 712), "hipR": (570, 712), "shL": (396, 428), "shR": (624, 428), "neck": (510, 350), "tail": (458, 456), "wrap": (510, 400), "feet": (510, 1480)}.items():
    print(n, pct(*p))
