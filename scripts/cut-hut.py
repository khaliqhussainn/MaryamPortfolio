"""Cut the hut out of art-src/hut-reference.webp, paint out the girl standing in its
doorway (the site's own puppet stands there instead), and save public/art/hut.webp.

Usage:  python3 scripts/cut-hut.py art-src/hut-reference.webp public/art/hut.webp
Prints the geometry used by .hut in app/globals.css.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
orig = np.asarray(im).copy()
a = orig.astype(np.int16)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]

# region that may contain the hut (roof, vines, bushes, sign, rocks, step)
BOX = (18, 175, 660, 738)
outline = [(18, 738), (18, 560), (40, 420), (60, 330), (150, 255), (300, 205), (330, 178), (380, 186), (470, 245),
           (560, 325), (605, 400), (640, 380), (645, 520), (660, 600), (660, 738)]
pm = Image.new("L", (W, H), 0)
ImageDraw.Draw(pm).polygon(outline, fill=255)
inside = np.asarray(pm) > 0

# background = pink sky / clouds, or the pale green hills and lawn
light = (R + G + B) > 600
sky = light & (B >= G - 6) & (R > 225)
hill = (G > 222) & (R > 180) & (B < 215) & (G > B + 25)
bgish = (sky | hill) & inside

# flood fill the background from the edge of the region, so pale bits inside the hut survive
seen = np.zeros((H, W), bool)
q = deque()
edge = np.asarray(pm.filter(ImageFilter.MaxFilter(5))) > 0
edge &= ~inside
ys, xs = np.where(np.asarray(pm.filter(ImageFilter.MaxFilter(3))) > 0)
for y, x in zip(ys, xs):
    if bgish[y, x] or not inside[y, x]:
        pass
for y in range(BOX[1], BOX[3]):
    for x in range(BOX[0], BOX[2]):
        if inside[y, x] and bgish[y, x] and not inside[max(0, y - 3):y + 4, max(0, x - 3):x + 4].all():
            seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if inside[ny, nx] and bgish[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
keep = inside & ~seen
keep = np.asarray(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127

# paint the girl out of the doorway: each row blends from the doorway pixels either side
girl = [(326, 372), (424, 372), (432, 470), (440, 560), (440, 690), (318, 690), (318, 560), (322, 470)]
gm = Image.new("L", (W, H), 0)
ImageDraw.Draw(gm).polygon(girl, fill=255)
hole = np.asarray(gm) > 0
rgb = orig.astype(float).copy()
for y in range(372, 691):
    xs_ = np.where(hole[y])[0]
    if not len(xs_): continue
    l, r = xs_.min() - 3, xs_.max() + 3
    cl = orig[y, l - 4:l + 1].mean(0); cr = orig[y, r:r + 5].mean(0)
    for x in xs_:
        t = (x - l) / (r - l)
        rgb[y, x] = cl * (1 - t) + cr * t
# soften the patch so it reads as shadowy interior
patch = Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
soft = Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
rgb_img = Image.composite(patch, Image.fromarray(rgb.clip(0, 255).astype(np.uint8)), soft)

alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
# fade the very bottom into the lawn
al = np.asarray(alpha).astype(float)
fade = np.clip((738 - yy) / 14, 0, 1)
al = (al * fade).astype(np.uint8)
hut = rgb_img.convert("RGBA")
hut.putalpha(Image.fromarray(al))
hut = hut.crop(BOX)
hut.save(out, "WEBP", quality=90, method=6)
w, h = hut.size
print("size", w, h)
# geometry, as fractions of the cropped image
door_cx, ground_y, girl_top, girl_feet = 378, 726, 382, 680
print("door centre x   %.4f" % ((door_cx - BOX[0]) / w))
print("ground y (from top) %.4f" % ((ground_y - BOX[1]) / h))
print("girl height / hut height %.4f" % ((girl_feet - girl_top) / h))
print("porch lift / hut height  %.4f" % ((ground_y - girl_feet) / h))
