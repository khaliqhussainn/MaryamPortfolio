"use client";
import { memo, useMemo } from "react";

/* ───────────────────────────────────────────────────────────────
   Soft, puffy scenery: one hidden <svg> holds every flower / bush /
   cloud as a <symbol>; the meadow and sky then just <use> them.
   ─────────────────────────────────────────────────────────────── */

const PETALS = [
  { id: "pink", a: "#ffd6ec", b: "#ff6fb4" },
  { id: "purple", a: "#eadcff", b: "#a57fe6" },
  { id: "orange", a: "#ffe0b8", b: "#fb8a3c" },
  { id: "blue", a: "#d9efff", b: "#5aa9f2" },
  { id: "white", a: "#ffffff", b: "#f0dff6" },
  { id: "coral", a: "#ffd9d3", b: "#ff7f7a" },
] as const;

type PetalId = (typeof PETALS)[number]["id"];

/* Flower head: five round petals around a glossy centre */
function Bloom({ id, cx = 30, cy = 36, r = 13, pr = 10.5 }: { id: PetalId; cx?: number; cy?: number; r?: number; pr?: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={cx + r * Math.sin((a * Math.PI) / 180)}
          cy={cy - r * Math.cos((a * Math.PI) / 180)}
          r={pr}
          fill={`url(#pg-${id})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={8.6} fill="url(#pg-center)" />
      <circle cx={cx - 2.6} cy={cy - 3} r={2.4} fill="#fff" opacity=".7" />
    </g>
  );
}

const Stem = () => (
  <>
    <path d="M30 99C28 82 33 66 30 48" stroke="#6dbb49" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <ellipse cx="19" cy="82" rx="11.5" ry="5.4" transform="rotate(-28 19 82)" fill="url(#pg-leaf)" />
    <ellipse cx="41.5" cy="73" rx="11.5" ry="5.4" transform="rotate(26 41.5 73)" fill="url(#pg-leaf)" />
  </>
);

export function SceneryDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {PETALS.map((p) => (
          <radialGradient key={p.id} id={`pg-${p.id}`} cx=".38" cy=".32" r=".8">
            <stop offset="0" stopColor={p.a} />
            <stop offset="1" stopColor={p.b} />
          </radialGradient>
        ))}
        <radialGradient id="pg-center" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#fff7a8" />
          <stop offset="1" stopColor="#ffbf3a" />
        </radialGradient>
        <linearGradient id="pg-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2f4a0" />
          <stop offset="1" stopColor="#78c653" />
        </linearGradient>
        <radialGradient id="pg-bush" cx=".4" cy=".3" r=".85">
          <stop offset="0" stopColor="#d6f2a6" />
          <stop offset="1" stopColor="#97d062" />
        </radialGradient>
        <radialGradient id="pg-cloud" cx=".45" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#f6eefc" />
          <stop offset="1" stopColor="#e6d6f7" />
        </radialGradient>
        <linearGradient id="pg-tulip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd0e6" />
          <stop offset="1" stopColor="#ff74b5" />
        </linearGradient>

        {PETALS.map((p) => (
          <symbol key={p.id} id={`fl-${p.id}`} viewBox="0 0 60 100">
            <Stem />
            <Bloom id={p.id} />
          </symbol>
        ))}

        {/* tulip */}
        <symbol id="tulip" viewBox="0 0 60 100">
          <Stem />
          <path d="M18 54C15 36 21 24 30 17c9 7 15 19 12 37-4 6-20 6-24 0Z" fill="url(#pg-tulip)" />
          <path d="M30 17c-6 8-9 20-6 38M30 17c6 8 9 20 6 38" stroke="#fff" strokeWidth="2" fill="none" opacity=".35" strokeLinecap="round" />
          <ellipse cx="25" cy="34" rx="3.2" ry="6.5" fill="#fff" opacity=".35" />
        </symbol>

        {/* daisy: many slim petals */}
        <symbol id="daisy" viewBox="0 0 60 100">
          <Stem />
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={i}
              cx="30" cy="22" rx="4.6" ry="11" fill="url(#pg-white)"
              transform={`rotate(${i * 36} 30 36)`}
              stroke="#e9d7f3" strokeWidth=".8"
            />
          ))}
          <circle cx="30" cy="36" r="7.4" fill="url(#pg-center)" />
          <circle cx="27.6" cy="33.4" r="2" fill="#fff" opacity=".7" />
        </symbol>

        {/* tuft of grass */}
        <symbol id="tuft" viewBox="0 0 60 100">
          <path d="M30 100C28 78 22 60 12 50 26 56 31 72 32 100Z" fill="url(#pg-leaf)" />
          <path d="M30 100C32 70 34 52 30 30 40 50 40 76 34 100Z" fill="url(#pg-leaf)" />
          <path d="M31 100C36 80 44 66 54 60 46 76 42 88 38 100Z" fill="url(#pg-leaf)" />
        </symbol>

        {/* bush */}
        <symbol id="bush" viewBox="0 0 100 70">
          <circle cx="26" cy="46" r="22" fill="url(#pg-bush)" />
          <circle cx="52" cy="34" r="29" fill="url(#pg-bush)" />
          <circle cx="76" cy="47" r="20" fill="url(#pg-bush)" />
          <circle cx="44" cy="22" r="8" fill="#fff" opacity=".28" />
          <circle cx="18" cy="38" r="5" fill="#fff" opacity=".25" />
          <circle cx="70" cy="38" r="5" fill="#fff" opacity=".22" />
        </symbol>

        {/* puffy cloud */}
        <symbol id="cloud" viewBox="0 0 200 110">
          <g fill="url(#pg-cloud)">
            <circle cx="52" cy="70" r="34" />
            <circle cx="98" cy="48" r="44" />
            <circle cx="148" cy="66" r="36" />
            <rect x="30" y="66" width="140" height="38" rx="19" />
          </g>
          <ellipse cx="84" cy="34" rx="20" ry="9" fill="#fff" opacity=".6" />
        </symbol>

        <symbol id="petal" viewBox="0 0 20 28">
          <path d="M10 1C18 8 19 19 10 27 1 19 2 8 10 1Z" fill="url(#pg-pink)" />
        </symbol>
        <symbol id="spark" viewBox="0 0 30 30">
          <path d="M15 1c1.4 8.5 5.5 12.6 14 14-8.5 1.4-12.6 5.5-14 14-1.4-8.5-5.5-12.6-14-14 8.5-1.4 12.6-5.5 14-14Z" fill="#fff" />
        </symbol>
      </defs>
    </svg>
  );
}

/* ── tiny deterministic random so server and client agree ── */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPECIES: { sym: string; ratio: string; w: number }[] = [
  { sym: "fl-pink", ratio: "3 / 5", w: 5 },
  { sym: "fl-purple", ratio: "3 / 5", w: 4 },
  { sym: "fl-orange", ratio: "3 / 5", w: 3 },
  { sym: "fl-blue", ratio: "3 / 5", w: 3 },
  { sym: "fl-white", ratio: "3 / 5", w: 3 },
  { sym: "fl-coral", ratio: "3 / 5", w: 3 },
  { sym: "tulip", ratio: "3 / 5", w: 3 },
  { sym: "daisy", ratio: "3 / 5", w: 4 },
  { sym: "tuft", ratio: "3 / 5", w: 5 },
];

/* Flowers scattered along the whole road.
   back  = behind Maryam (most of them), front = brushing past her feet. */
export const Meadow = memo(function Meadow({ width, layer }: { width: number; layer: "back" | "front" }) {
  const items = useMemo(() => {
    const r = rng(layer === "back" ? 7 : 91);
    const total = SPECIES.reduce((s, x) => s + x.w, 0);
    const out: { x: number; depth: number; sym: string; ratio: string; scale: number; delay: number; dur: number; sway: boolean; z: number }[] = [];
    const gap = layer === "back" ? 128 : 420;
    for (let x = 40; x < width; x += gap * (0.55 + r() * 0.9)) {
      const bush = layer === "back" && r() < 0.04;
      let pick = r() * total, sp = SPECIES[0];
      for (const s of SPECIES) { pick -= s.w; if (pick <= 0) { sp = s; break; } }
      const depth = layer === "back" ? r() * 0.82 : 0.9 + r() * 0.1;
      out.push({
        x,
        depth,
        sym: bush ? "bush" : sp.sym,
        ratio: bush ? "10 / 7" : sp.ratio,
        scale: bush ? 0.7 + r() * 0.5 : (layer === "back" ? 0.62 + depth * 0.5 + r() * 0.4 : 0.8 + r() * 0.25),
        delay: -r() * 6,
        dur: 3.2 + r() * 2.6,
        sway: !bush && r() < 0.72,
        z: Math.round(depth * 100),
      });
    }
    return out.sort((a, b) => a.depth - b.depth);
  }, [width, layer]);

  if (!width) return null;
  /* split into patches: patches far from the screen are skipped and their animations paused */
  const SEG = 1400, PAD = 60;
  const segs: (typeof items)[] = [];
  for (const f of items) (segs[Math.floor(f.x / SEG)] ??= []).push(f);
  return (
    <div className={`meadow meadow-${layer}`} style={{ width }} aria-hidden>
      {segs.map((list, k) => list && (
        <div key={k} className="m-seg" data-lazy style={{ left: k * SEG - PAD, width: SEG + PAD + 220 }}>
          {list.map((f, i) => (
        <svg
          key={i}
          className={`m-fl ${f.sway ? "sway" : ""}`}
          viewBox={f.sym === "bush" ? "0 0 100 70" : "0 0 60 100"}
          style={{
            left: f.x - (k * SEG - PAD),
            bottom: `calc(var(--ground) - ${(f.depth * 6.2 + 1.2).toFixed(2)}dvh)`,
            height: `calc(var(--fh) * ${f.scale.toFixed(2)})`,
            aspectRatio: f.ratio,
            zIndex: f.z,
            animationDelay: `${f.delay.toFixed(2)}s`,
            animationDuration: `${f.dur.toFixed(2)}s`,
          }}
        >
          <use href={`#${f.sym}`} />
        </svg>
          ))}
        </div>
      ))}
    </div>
  );
});

/* ── the moving sky: puffy clouds and drifting petals / sparkles ── */
export const Clouds = memo(function Clouds() {
  const items = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: 16 }, (_, i) => ({
      left: `${(i + r() * 0.7) * 6.1 + 1}%`,
      top: `${4 + r() * 26}%`,
      w: 90 + r() * 150,
      op: 0.55 + r() * 0.4,
      dur: 14 + r() * 14,
      delay: -r() * 20,
      amp: 10 + r() * 26,
    }));
  }, []);
  return (
    <>
      {items.map((c, i) => (
        <svg
          key={i}
          className="cloud"
          viewBox="0 0 200 110"
          style={{
            left: c.left, top: c.top, width: c.w, opacity: c.op,
            animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`, ["--amp" as string]: `${c.amp}px`,
          }}
        >
          <use href="#cloud" />
        </svg>
      ))}
    </>
  );
});

export const Petals = memo(function Petals() {
  const items = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 26 }, (_, i) => ({
      left: `${(i + r() * 0.8) * 3.8}%`,
      top: `${6 + r() * 60}%`,
      size: 10 + r() * 16,
      spark: r() < 0.45,
      dur: 5 + r() * 6,
      delay: -r() * 10,
      rot: r() * 360,
    }));
  }, []);
  return (
    <>
      {items.map((p, i) => (
        <svg
          key={i}
          className={`petal ${p.spark ? "is-spark" : ""}`}
          viewBox={p.spark ? "0 0 30 30" : "0 0 20 28"}
          style={{
            left: p.left, top: p.top, width: p.size, height: p.spark ? p.size : p.size * 1.4,
            animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ["--rot" as string]: `${p.rot}deg`,
          }}
        >
          <use href={p.spark ? "#spark" : "#petal"} />
        </svg>
      ))}
    </>
  );
});
