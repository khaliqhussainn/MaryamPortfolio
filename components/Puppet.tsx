"use client";
import { useEffect, useRef } from "react";
import { createMotion, live, stepMotion, trackPointer } from "@/lib/personaMotion";

/* Maryam as a 2D cut-out puppet: her illustration split into layers
   (public/art/puppet) that swing around these joints.
   Joint positions are % of the layer image (342 × 1000). */
const J = {
  hipL: "36% 47%", hipR: "62% 47%",
  shL: "27.2% 27.6%", shR: "72.8% 27.6%",
  neck: "50% 22.3%", wrap: "50% 25.7%", tail: "39.6% 29.5%",
  feet: "50% 99.4%", hips: "50% 47%",
};

type Part = "rig" | "legL" | "legR" | "upper" | "armL" | "armR" | "head" | "blink" | "wrap" | "tail" | "shadow";

export default function Puppet({ box }: { box: React.RefObject<HTMLDivElement | null> }) {
  const el = useRef<Partial<Record<Part, HTMLElement | null>>>({});
  const set = (k: Part) => (n: HTMLElement | null) => { el.current[k] = n; };

  useEffect(() => {
    const m = createMotion();
    const untrack = box.current ? trackPointer(box.current) : () => {};
    let raf = 0, last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepMotion(m, dt);

      const e = el.current;
      const w = m.walk, idle = 1 - w, t = m.t;
      const s = Math.sin(m.phase), c = Math.cos(m.phase);
      const liftL = Math.max(0, s) * w, liftR = Math.max(0, -s) * w;

      /* whole body: lean into the walk, gentle idle sway */
      e.rig!.style.transform =
        `translateX(${m.lead * 5}%) rotate(${m.lead * 3 + s * 1.1 * w + Math.sin(t * 0.9) * 0.5 * idle}deg)`;
      /* steps: each leg lifts and swings in turn */
      e.legL!.style.transform = `translate(${m.dir * liftL * 2.4}%, ${-liftL * 2.2}%) rotate(${-s * 3.5 * w}deg)`;
      e.legR!.style.transform = `translate(${m.dir * liftR * 2.4}%, ${-liftR * 2.2}%) rotate(${-s * 3.5 * w}deg)`;
      /* upper body bobs with each step and breathes when idle */
      e.upper!.style.transform =
        `translateY(${(0.35 - Math.abs(s) * 0.8) * w}%) scaleY(${1 + Math.sin(t * 2) * 0.004 * idle})`;
      /* arms swing; her left arm (viewer's right) waves */
      e.armL!.style.transform = `rotate(${s * 9 * w + (1.2 + Math.sin(t * 1.3) * 0.8) * idle}deg)`;
      e.armR!.style.transform =
        `rotate(${-s * 9 * w * (1 - m.wave) - (1.2 + Math.sin(t * 1.3 + 1) * 0.8) * idle * (1 - m.wave) - m.wave * (148 + Math.sin(t * 11) * 14)}deg)`;
      /* head follows the visitor, tilts while waving */
      e.head!.style.transform =
        `translate(${live.px * 0.8 * idle}%, ${live.py * 0.25 * idle}%) rotate(${(live.px * 5 + Math.sin(t * 0.7) * 1.4) * idle + m.wave * 4 + s * 1.2 * w}deg)`;
      e.blink!.style.opacity = m.blink > 0 ? "1" : "0";
      /* scarf follows a beat behind */
      e.wrap!.style.transform = `rotate(${Math.sin(t * 1.2) * 0.4 + s * 0.8 * w}deg)`;
      e.tail!.style.transform = `rotate(${Math.sin(t * 1.6) * 1.6 + c * 4.5 * w - m.lead * 6}deg)`;
      e.shadow!.style.transform = `scaleX(${1 - Math.abs(s) * 0.08 * w})`;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); untrack(); };
  }, [box]);

  const img = (name: string, part: Part, origin: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={set(part)} src={`/art/puppet/${name}.webp`} alt="" draggable={false} className="pp-layer" style={{ transformOrigin: origin }} />
  );

  return (
    <div className="puppet" aria-hidden>
      <div ref={set("shadow")} className="pp-shadow" />
      <div ref={set("rig")} className="pp-group" style={{ transformOrigin: J.feet }}>
        {img("legL", "legL", J.hipL)}
        {img("legR", "legR", J.hipR)}
        <div ref={set("upper")} className="pp-group" style={{ transformOrigin: J.hips }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/puppet/torso.webp" alt="" draggable={false} className="pp-layer" />
          {img("armL", "armL", J.shL)}
          {img("armR", "armR", J.shR)}
          <div ref={set("head")} className="pp-group" style={{ transformOrigin: J.neck }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/puppet/head.webp" alt="" draggable={false} className="pp-layer" />
            {img("blink", "blink", J.neck)}
          </div>
          {img("wrap", "wrap", J.wrap)}
          {img("tail", "tail", J.tail)}
        </div>
      </div>
    </div>
  );
}
