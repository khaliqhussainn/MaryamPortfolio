"""Cut the signpost in art-src/signpost-reference.webp into pieces the nav signpost is built from:
the post's rounded cap, a 1px slice of the post (stretched to any height), the grassy base,
and one plank (reused for every link).

Usage:  python3 scripts/cut-signpost.py art-src/signpost-reference.webp public/art/sign
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque


def morph(m, size, op):
    f = ImageFilter.MaxFilter(size) if op == "max" else ImageFilter.MinFilter(size)
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(f)) > 127


def flood(mask, seeds):
    seen = np.zeros_like(mask)
    q = deque(s for s in seeds if mask[s])
    for s in q: seen[s] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(int)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
H, W = R.shape
# the backdrop and its shadow are blue; everything else is the signpost
fg = ~((B > R + 25) & (B > G - 10))
fg = morph(morph(fg, 3, 'min'), 3, 'max')

def save(mask, box, name, blur=0.8):
    al = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    img = im.convert("RGBA"); img.putalpha(al)
    img = img.crop(box)
    img.save(f"{out}/{name}.webp", "WEBP", quality=92, method=6)
    print(name, img.size)

PX0, PX1 = 893, 1054  # the post
# cap: rounded top of the post, down to just above the first plank
cap = fg.copy(); cap[:, :PX0 - 2] = False; cap[:, PX1 + 2:] = False
save(cap, (PX0 - 2, 262, PX1 + 2, 400), "cap")
# slice: one clean row of the post, stretched vertically on the page
Image.fromarray(a[1118:1119, PX0 - 1:PX1 + 2].astype(np.uint8)).convert("RGBA").save(f"{out}/post.png")
# base: grass and the dirt mound, with the post stub behind the grass
base = fg.copy(); base[:1116] = False
save(base, (528, 1116, 1410, 1600), "base")
# plank: the top board, with its nail
pl = fg & (R > 150) & (R - B > 45)
pl[:417] = False  # the post above the plank is brown too
plank = flood(pl, [(520, 1200)])
plank = morph(morph(plank, 5, 'max'), 5, 'min')
# fill holes (the nail): anything not reachable from the border is inside
outside = flood(~plank, [(0, 0)])
plank = ~outside
ys, xs = np.where(plank)
box = (xs.min() - 2, ys.min() - 2, xs.max() + 3, ys.max() + 3)
save(plank, box, "plank", 0.7)
print("plank box", box, "nail centre ->", (910 - box[0]) / (box[2] - box[0]), (510 - box[1]) / (box[3] - box[1]))
print("post centre in plank", (973.5 - box[0]) / (box[2] - box[0]))
