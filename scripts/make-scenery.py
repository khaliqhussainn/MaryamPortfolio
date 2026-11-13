"""Generates the seamless background tiles in public/scenery (far hills, mid hills with bushes, lawn).
Run:  python3 scripts/make-scenery.py
"""
import math, os
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "scenery")
os.makedirs(OUT, exist_ok=True)

def wave(P, base, comps):
    # periodic: every component repeats a whole number of times across the tile
    return lambda x: base + sum(a * math.sin(2 * math.pi * k * x / P + ph) for a, k, ph in comps)

def path(P, H, f, step=10):
    pts = [f(x) for x in range(0, P + 1, step)]
    d = "M0 %.1f " % pts[0] + " ".join("L%d %.1f" % (i * step, y) for i, y in enumerate(pts) if i)
    return d + " L%d %d L0 %d Z" % (P, H, H), pts

def bush(cx, cy, s):
    # three puffy lobes with a soft highlight
    lobes = [(-30, 6, 26), (0, -8, 34), (32, 8, 24)]
    out = ""
    for dx, dy, r in lobes:
        out += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="url(#bush)"/>' % (cx + dx * s, cy + dy * s, r * s)
    for dx, dy, r in lobes:
        out += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff" opacity=".28"/>' % (cx + (dx - r * .28) * s, cy + (dy - r * .3) * s, r * .34 * s)
    return out

# ── far hills: pale, hazy ──
P, H = 1800, 320
f = wave(P, 150, [(34, 2, 0.4), (16, 5, 1.7), (9, 9, 2.6)])
d, _ = path(P, H, f)
open(OUT + "/hills-far.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{P}" height="{H}" viewBox="0 0 {P} {H}" preserveAspectRatio="none">'
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf8cf"/><stop offset="1" stop-color="#d9f1b3"/></linearGradient></defs>'
    f'<path d="{d}" fill="url(#g)" opacity=".92"/></svg>')

# ── mid hills with bushes ──
P, H = 1500, 300
f = wave(P, 150, [(30, 3, 2.1), (14, 7, 0.3), (7, 11, 1.2)])
d, _ = path(P, H, f)
bushes = "".join(bush(x, f(x) + 6, s) for x, s in ((210, 0.62), (760, 0.5), (1090, 0.7), (1380, 0.54)))
open(OUT + "/hills-mid.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{P}" height="{H}" viewBox="0 0 {P} {H}" preserveAspectRatio="none">'
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4f0a6"/><stop offset="1" stop-color="#bfe58d"/></linearGradient>'
    '<radialGradient id="bush" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#cdee9a"/><stop offset="1" stop-color="#a3d56c"/></radialGradient></defs>'
    f'<path d="{d}" fill="url(#g)"/>{bushes}</svg>')

# ── foreground lawn ──
P, H = 1200, 200
f = wave(P, 34, [(7, 2, 0.8), (3.5, 5, 2.2)])
d, pts = path(P, H, f, 8)
edge = "M0 %.1f " % pts[0] + " ".join("L%d %.1f" % (i * 8, y) for i, y in enumerate(pts) if i)
open(OUT + "/lawn.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{P}" height="{H}" viewBox="0 0 {P} {H}" preserveAspectRatio="none">'
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f4ad"/><stop offset=".35" stop-color="#c6ea92"/><stop offset="1" stop-color="#a9d776"/></linearGradient></defs>'
    f'<path d="{d}" fill="url(#g)"/><path d="{edge}" fill="none" stroke="#eefcd3" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>')
print("ok")
