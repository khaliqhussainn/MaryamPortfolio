"""Cut Maryam's side-view illustration (facing right) into the walking puppet layers.

Usage:  python3 scripts/cut-puppet-side.py art-src/maryam-side.webp public/art/puppet
Writes side-*.webp next to the front layers. Needs Pillow and numpy.
Coordinates are tuned to art-src/maryam-side.webp (1024 x 1536); the joint positions
printed at the end belong in the SJ table in components/Puppet.tsx.
"""
import os, sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert("RGB")
W, H = im.size
orig = np.asarray(im).copy()
a = orig.astype(np.int16)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
mask_img = lambda m: Image.fromarray((m * 255).astype(np.uint8))

# ── background: flood fill from the border ──
bg = np.array([247, 239, 248])
near = np.abs(a - bg).sum(-1) < 26
seen = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if near[y, x]: seen[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and near[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
alpha = np.asarray(mask_img(~seen).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))).copy()

blue = B > R + 12
lum = 0.3 * R + 0.59 * G + 0.11 * B
dark = lum < 80

# ── the near arm: sleeve, cuff and hand ──
poly = [(437, 410), (540, 410), (546, 440), (552, 530), (553, 630), (550, 700), (540, 745), (533, 758), (535, 808),
        (548, 830), (548, 915), (458, 915), (462, 860), (452, 808), (452, 762), (425, 748), (415, 725), (414, 620),
        (416, 520), (422, 460)]
pm = Image.new("L", (W, H), 0)
ImageDraw.Draw(pm).polygon(poly, fill=255)
inarm = np.asarray(pm) > 0
inarm_wide = np.asarray(pm.filter(ImageFilter.MaxFilter(9))) > 0

# ── shoes: warm white, while backdrop and floor shadow are neutral lavender ──
shoe = np.zeros((H, W), bool)
warm = ((R - B) >= 9) & (yy > 1385) & (yy < 1492) & (xx > 340) & (xx < 660) & ~blue
warm = np.asarray(mask_img(warm).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))) > 0
for y in range(1385, 1492):
    xs = np.where(warm[y])[0]
    if len(xs) > 4: shoe[y, xs.min():xs.max() + 1] = True
sa = np.asarray(mask_img(shoe).filter(ImageFilter.GaussianBlur(0.9)))
alpha = np.where((yy > 1385) & (yy < 1492) & ~blue, sa, alpha)

# ── denim: each row of the leg is one solid shape; the pale hem stitching is
#    close to the backdrop colour, so it is forced opaque here ──
denim = np.zeros((H, W), bool)
for y in range(760, 1476):
    xs = np.where(blue[y] & ~inarm_wide[y])[0]
    if len(xs) > 10:
        denim[y, xs.min():xs.max() + 1] = True
        alpha[y, xs.min() + 1:xs.max()] = 255
body = alpha > 8

arm = body & inarm & ~dark & ~blue
legs = body & (yy > 740) & (denim | blue | shoe) & ~arm
upper = body & ~arm & ~legs & (yy < 806)

rgb = orig.copy()

# shirt continues behind the arm: a smooth tone from the visible back of the shirt on each row
shirt_ok = body & ~inarm_wide & ~dark & ~blue & (yy < 800)
hole_shirt = arm & (yy < 772)
tone = np.full((H, 3), np.nan)
for y in range(405, 800):
    xs = np.where(shirt_ok[y, 370:430])[0]
    if len(xs) > 6: tone[y] = np.median(orig[y, 370 + xs[len(xs) // 3:]], axis=0)
first = next(y for y in range(405, 800) if not np.isnan(tone[y, 0]))
tone[405:first] = tone[first]
for y in range(first + 1, 800):
    if np.isnan(tone[y, 0]): tone[y] = tone[y - 1]
k = np.exp(-np.linspace(-2, 2, 25) ** 2); k /= k.sum()
for c in range(3):
    tone[405:800, c] = np.convolve(np.pad(tone[405:800, c], 12, mode="edge"), k, mode="valid")
for y in range(405, 772):
    xs = np.where(hole_shirt[y])[0]
    if len(xs): rgb[y, xs] = tone[y].astype(np.uint8)

# jeans continue behind the hand: real denim borrowed from just below (same shading down the leg)
hole_jeans = body & inarm_wide & (yy >= 782) & (yy < 925)
for y in range(782, 925):
    for x in np.where(hole_jeans[y])[0]:
        rgb[y, x] = orig[y + 150, x]

def layer(mask, colours, darken=(1, 1, 1)):
    A = np.where(mask, alpha, 0).astype(np.uint8)
    c = (colours.astype(float) * np.array(darken)).clip(0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([c, A]), "RGBA")

leg_mask = legs | hole_jeans
leg_img = layer(leg_mask, rgb)
ImageDraw.Draw(leg_img).rectangle([392, 735, 562, 800], fill=tuple(int(v) for v in rgb[840, 420]) + (255,))  # denim up under the shirt
far = (0.8, 0.8, 0.86, 1)
leg_far = Image.fromarray((np.asarray(leg_img).astype(float) * far).clip(0, 255).astype(np.uint8), "RGBA")

# closed eye for blinking
blink = Image.new("RGBA", (W, H), (0, 0, 0, 0))
x0, x1, y0, y1 = 548, 604, 184, 244
patch = Image.new("RGBA", (x1 - x0, y1 - y0))
for x in range(x0, x1):
    top = orig[y0 - 4, x].astype(float); bot = orig[y1 + 6, x].astype(float)
    for y in range(y0, y1):
        t = (y - y0) / (y1 - y0)
        patch.putpixel((x - x0, y - y0), tuple(int(v) for v in top * (1 - t) + bot * t) + (255,))
m = Image.new("L", patch.size, 0)
ImageDraw.Draw(m).ellipse([2, 2, patch.size[0] - 3, patch.size[1] - 3], fill=255)
blink.paste(patch, (x0, y0), m.filter(ImageFilter.GaussianBlur(2.5)))
dd = ImageDraw.Draw(blink)
dd.line([(556 + i, 222 + 7 * (1 - ((i - 21) / 21) ** 2)) for i in range(0, 43, 3)], fill=(38, 28, 28, 255), width=5, joint="curve")
dd.line([(556, 222), (546, 214)], fill=(38, 28, 28, 255), width=4)

layers = {
    "side-legFar": leg_far, "side-leg": leg_img, "side-upper": layer(upper | hole_shirt, rgb),
    "side-armFar": layer(arm, orig, (0.8, 0.8, 0.86)), "side-arm": layer(arm, orig), "side-blink": blink,
}
X0, Y0, X1, Y1 = 245, 24, 745, 1488
size = (round((X1 - X0) * 1000 / (Y1 - Y0)), 1000)
for name, img in layers.items():
    img.crop((X0, Y0, X1, Y1)).resize(size, Image.LANCZOS).save(f"{out}/{name}.webp", "WEBP", quality=88, method=6)
def pct(x, y): return round((x - X0) / (X1 - X0) * 100, 2), round((y - Y0) / (Y1 - Y0) * 100, 2)
for n, p in {"hip": (475, 780), "shoulder": (490, 430), "feet": (497, 1483)}.items():
    print(n, pct(*p))
