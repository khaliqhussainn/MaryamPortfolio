import { scroll } from "@/lib/scrollStore";

/* Pointer + hover, shared by the persona renderers without re-rendering React */
export const live = { hover: false, px: 0, py: 0 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Everything about how she moves, independent of how she is drawn */
export function createMotion() {
  return {
    t: 0, walk: 0, phase: 0, dir: 1, wave: 0, lead: 0, speed: 0, moving: false,
    still: 0, nextWave: 7, waveUntil: 0, nextBlink: 2, blink: 0,
  };
}
export type Motion = ReturnType<typeof createMotion>;

export function stepMotion(m: Motion, dt: number) {
  m.t += dt;

  /* Walking follows the scroll */
  const speed = Math.abs(scroll.v) / Math.max(dt, 0.001); // px / s
  const moving = speed > 26;
  if (moving) { m.dir = scroll.v > 0 ? 1 : -1; m.still = 0; } else m.still += dt;
  m.walk = lerp(m.walk, moving ? 1 : 0, 1 - Math.exp(-dt * (moving ? 12 : 7)));
  m.phase += Math.min(15, Math.max(moving ? 6 : 0, speed * 0.011)) * dt;
  /* She leans a little into the direction of travel */
  m.lead = lerp(m.lead, moving ? m.dir * Math.min(1, speed / 1400) : 0, 1 - Math.exp(-dt * 4));

  /* Wave: on hover, and every so often while she waits */
  if (live.hover) m.waveUntil = m.t + 0.4;
  if (m.still > m.nextWave) { m.waveUntil = m.t + 1.8; m.still = 0; m.nextWave = 8 + Math.random() * 6; }
  m.wave = lerp(m.wave, m.t < m.waveUntil && !moving ? 1 : 0, 1 - Math.exp(-dt * 10));

  /* Blink */
  m.nextBlink -= dt;
  if (m.nextBlink < 0) { m.blink = 0.14; m.nextBlink = 2.4 + Math.random() * 3; }
  m.blink = Math.max(0, m.blink - dt);

  m.speed = speed;
  m.moving = moving;
}

/* Track the pointer relative to the persona box */
export function trackPointer(box: HTMLElement) {
  const onMove = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    live.px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
    live.py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.25)) / (window.innerHeight * 0.5)));
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}
