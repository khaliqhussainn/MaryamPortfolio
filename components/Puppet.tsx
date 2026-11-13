"use client";
import { useEffect, useRef } from "react";
import { createMotion, live, stepMotion, trackPointer } from "@/lib/personaMotion";

/* Maryam as a 2D cut-out puppet: her illustrations split into layers
   (public/art/puppet) that swing around these joints.
   She faces the visitor when standing and turns side-on to walk.
   Joint positions are % of the layer images (342 × 1000). */
const J = {
  hipL: "36% 47%", hipR: "62% 47%",
  shL: "27.2% 27.6%", shR: "72.8% 27.6%",
  neck: "50% 22.3%", wrap: "50% 25.7%", tail: "39.6% 29.5%",
  feet: "50% 99.4%", hips: "50% 47%",
};
/* side view (drawn facing right) */
const SJ = { hip: "46% 51.6%", shoulder: "49% 27.7%", feet: "50.4% 99.7%" };

const TURN = 0.22; // seconds for the little turn between views

type Part =
  | "turn" | "front" | "side" | "flip" | "shadow"
  | "rig" | "legL" | "legR" | "upper" | "armL" | "armR" | "head" | "blink" | "wrap" | "tail"
  | "sRig" | "sLegFar" | "sLeg" | "sUpper" | "sArmFar" | "sArm" | "sBlink";

export default function Puppet({ box }: { box: React.RefObject<HTMLDivElement | null> }) {
  const el = useRef<Partial<Record<Part, HTMLElement | null>>>({});
  const set = (k: Part) => (n: HTMLElement | null) => { el.current[k] = n; };

  useEffect(() => {
    const m = createMotion();
    const untrack = box.current ? trackPointer(box.current) : () => {};
    let raf = 0, last = performance.now();
    /* which view is showing, and the turn in progress */
    let sideOn = false, facing = 1, turn = 0, swapped = true, wantSide = false, wantFacing = 1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepMotion(m, dt);

      const e = el.current;
      const w = m.walk, idle = 1 - w, t = m.t;
      const s = Math.sin(m.phase), c = Math.cos(m.phase);

      /* ── side-on while walking, front-facing once she stops ── */
      const want = sideOn ? m.walk > 0.22 : m.moving && m.walk > 0.5;
      if (turn <= 0 && (want !== sideOn || (sideOn && want && m.dir !== facing))) {
        wantSide = want; wantFacing = m.dir; turn = TURN; swapped = false;
      }
      let squash = 1;
      if (turn > 0) {
        turn = Math.max(0, turn - dt);
        const p = 1 - turn / TURN;
        squash = 1 - 0.32 * Math.sin(Math.PI * p);
        if (!swapped && p >= 0.5) {
          sideOn = wantSide; facing = wantFacing; swapped = true;
          e.front!.style.opacity = sideOn ? "0" : "1";
          e.side!.style.opacity = sideOn ? "1" : "0";
          e.flip!.style.transform = `scaleX(${facing})`;
        }
      }
      e.turn!.style.transform = `translateX(${m.lead * 5}%) scaleX(${squash})`;
      e.shadow!.style.transform = `scaleX(${(1 - Math.abs(s) * 0.08 * w) * (sideOn ? 1.15 : 1)})`;

      if (!sideOn || turn > 0) {
        /* ── front view: idle sway, waving, looking at the visitor ── */
        const liftL = Math.max(0, s) * w, liftR = Math.max(0, -s) * w;
        e.rig!.style.transform = `rotate(${m.lead * 3 + s * 1.1 * w + Math.sin(t * 0.9) * 0.5 * idle}deg)`;
        e.legL!.style.transform = `translate(${m.dir * liftL * 2.4}%, ${-liftL * 2.2}%) rotate(${-s * 3.5 * w}deg)`;
        e.legR!.style.transform = `translate(${m.dir * liftR * 2.4}%, ${-liftR * 2.2}%) rotate(${-s * 3.5 * w}deg)`;
        e.upper!.style.transform =
          `translateY(${(0.35 - Math.abs(s) * 0.8) * w}%) scaleY(${1 + Math.sin(t * 2) * 0.004 * idle})`;
        e.armL!.style.transform = `rotate(${s * 9 * w + (1.2 + Math.sin(t * 1.3) * 0.8) * idle}deg)`;
        e.armR!.style.transform =
          `rotate(${-s * 9 * w * (1 - m.wave) - (1.2 + Math.sin(t * 1.3 + 1) * 0.8) * idle * (1 - m.wave) - m.wave * (148 + Math.sin(t * 11) * 14)}deg)`;
        e.head!.style.transform =
          `translate(${live.px * 0.8 * idle}%, ${live.py * 0.25 * idle}%) rotate(${(live.px * 5 + Math.sin(t * 0.7) * 1.4) * idle + m.wave * 4 + s * 1.2 * w}deg)`;
        e.blink!.style.opacity = m.blink > 0 ? "1" : "0";
        e.wrap!.style.transform = `rotate(${Math.sin(t * 1.2) * 0.4 + s * 0.8 * w}deg)`;
        e.tail!.style.transform = `rotate(${Math.sin(t * 1.6) * 1.6 + c * 4.5 * w - m.lead * 6}deg)`;
      }

      if (sideOn || turn > 0) {
        /* ── side view: a proper stride ── */
        const stride = 13 * w, swing = 17 * w;
        const bob = `translateY(${(0.5 - Math.abs(s) * 1.2) * w}%)`;
        e.sRig!.style.transform = `rotate(${0.8 * w}deg)`;
        e.sLeg!.style.transform = `translateY(${-Math.max(0, c) * 1.1 * w}%) rotate(${-s * stride}deg)`;
        e.sLegFar!.style.transform = `translateY(${-Math.max(0, -c) * 1.1 * w}%) rotate(${s * stride}deg)`;
        e.sUpper!.style.transform = `${bob} rotate(${1.6 * w}deg)`;
        e.sArm!.style.transform = `rotate(${s * swing}deg)`;
        e.sArmFar!.style.transform = `${bob} rotate(${-s * swing}deg)`;
        e.sBlink!.style.opacity = m.blink > 0 ? "1" : "0";
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); untrack(); };
  }, [box]);

  const img = (name: string, part: Part | null, origin?: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={part ? set(part) : undefined} src={`/art/puppet/${name}.webp`} alt="" draggable={false} className="pp-layer" style={origin ? { transformOrigin: origin } : undefined} />
  );

  return (
    <div className="puppet" aria-hidden>
      <div ref={set("shadow")} className="pp-shadow" />
      <div ref={set("turn")} className="pp-group" style={{ transformOrigin: J.feet }}>
        {/* front view */}
        <div ref={set("front")} className="pp-view">
          <div ref={set("rig")} className="pp-group" style={{ transformOrigin: J.feet }}>
            {img("legL", "legL", J.hipL)}
            {img("legR", "legR", J.hipR)}
            <div ref={set("upper")} className="pp-group" style={{ transformOrigin: J.hips }}>
              {img("torso", null)}
              {img("armL", "armL", J.shL)}
              {img("armR", "armR", J.shR)}
              <div ref={set("head")} className="pp-group" style={{ transformOrigin: J.neck }}>
                {img("head", null)}
                {img("blink", "blink", J.neck)}
              </div>
              {img("wrap", "wrap", J.wrap)}
              {img("tail", "tail", J.tail)}
            </div>
          </div>
        </div>

        {/* side view, mirrored when she walks left */}
        <div ref={set("side")} className="pp-view" style={{ opacity: 0 }}>
          <div ref={set("flip")} className="pp-group" style={{ transformOrigin: "50.4% 50%" }}>
            <div ref={set("sRig")} className="pp-group" style={{ transformOrigin: SJ.feet }}>
              {img("side-armFar", "sArmFar", SJ.shoulder)}
              {img("side-legFar", "sLegFar", SJ.hip)}
              {img("side-leg", "sLeg", SJ.hip)}
              <div ref={set("sUpper")} className="pp-group" style={{ transformOrigin: SJ.hip }}>
                {img("side-upper", null)}
                {img("side-blink", "sBlink")}
                {img("side-arm", "sArm", SJ.shoulder)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
