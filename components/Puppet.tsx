"use client";
import { useEffect, useRef } from "react";
import { createMotion, live, stepMotion, trackPointer } from "@/lib/personaMotion";
import { intro, INTRO } from "@/lib/scrollStore";

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
/* the hut's porch floor and the jump, in % of the puppet's height */
const PORCH = 15.3, ARC = 13;

type Part =
  | "hop" | "turn" | "front" | "side" | "flip" | "shadow"
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

      /* ── the hut: standing on the porch, hopping out, hopping back in ── */
      let lift = 0, ground = 0, squashY = 1, pose = 0, forceSide = false;
      const it = intro.t;
      if (intro.phase === "home") {
        lift = ground = PORCH;
      } else if (intro.phase === "leaving") {
        forceSide = true;
        if (it < INTRO.crouch) {
          lift = ground = PORCH;
          squashY = 1 - 0.09 * Math.sin((Math.PI * it) / INTRO.crouch);
        } else {
          const p = Math.min(1, (it - INTRO.crouch) / INTRO.air);
          ground = PORCH * Math.max(0, 1 - p * 1.6);
          lift = PORCH * (1 - p) + 4 * ARC * p * (1 - p);
          squashY = 1 + 0.06 * Math.sin(Math.PI * p);
          pose = Math.sin(Math.PI * Math.min(1, p * 1.15));
        }
      } else if (intro.phase === "out" && it < INTRO.land) {
        squashY = 1 - 0.08 * Math.sin((Math.PI * it) / INTRO.land); // landing
      } else if (intro.phase === "returning") {
        if (it < INTRO.retCrouch) {
          squashY = 1 - 0.08 * Math.sin((Math.PI * it) / INTRO.retCrouch);
        } else {
          const p = Math.min(1, (it - INTRO.retCrouch) / INTRO.retAir);
          lift = PORCH * p + 4 * ARC * 0.8 * p * (1 - p);
          ground = PORCH * Math.min(1, Math.max(0, p * 1.6 - 0.6));
          squashY = 1 + 0.05 * Math.sin(Math.PI * p);
        }
      }
      e.hop!.style.transform = `translateY(${-lift}%) scaleY(${squashY})`;
      e.shadow!.style.bottom = `${ground - 1.4}%`;
      e.shadow!.style.opacity = `${1 - Math.min(0.6, (lift - ground) / 30)}`;
      box.current?.style.setProperty("--lift", (lift * 0.78).toFixed(2));

      /* ── side-on while walking, front-facing once she stops ── */
      const want = forceSide || (sideOn ? m.walk > 0.22 : m.moving && m.walk > 0.5);
      const dir = forceSide ? 1 : m.dir;
      if (turn <= 0 && (want !== sideOn || (sideOn && want && dir !== facing))) {
        wantSide = want; wantFacing = dir; turn = TURN; swapped = false;
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
        /* walking stride, blended into a leap pose while she jumps */
        const ww = w * (1 - pose), stride = 13 * ww, swing = 17 * ww;
        const bob = `translateY(${(0.5 - Math.abs(s) * 1.2) * ww}%)`;
        e.sRig!.style.transform = `rotate(${0.8 * ww + 4 * pose}deg)`;
        e.sLeg!.style.transform = `translateY(${-Math.max(0, c) * 1.1 * ww}%) rotate(${-s * stride - 20 * pose}deg)`;
        e.sLegFar!.style.transform = `translateY(${-Math.max(0, -c) * 1.1 * ww}%) rotate(${s * stride + 17 * pose}deg)`;
        e.sUpper!.style.transform = `${bob} rotate(${1.6 * ww + 2 * pose}deg)`;
        e.sArm!.style.transform = `rotate(${s * swing - 48 * pose}deg)`;
        e.sArmFar!.style.transform = `${bob} rotate(${-s * swing + 30 * pose}deg)`;
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
      <div ref={set("hop")} className="pp-group" style={{ transformOrigin: J.feet }}>
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
    </div>
  );
}
