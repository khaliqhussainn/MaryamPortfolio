"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type * as THREE_NS from "three";
import { scroll, goTo } from "@/lib/scrollStore";
import { buildCharacter, type Rig } from "@/components/personaModel";

/* Shared with the render loop without re-rendering React */
const live = { hover: false, px: 0, py: 0 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Persona() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => { live.hover = hover; }, [hover]);

  useEffect(() => {
    let dead = false, raf = 0;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (dead || !box.current || !canvas.current) return;
      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: true });
      } catch {
        setFallback(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0xf1e2d6, 1.9));
      const key = new THREE.DirectionalLight(0xfff6ee, 1.9);
      key.position.set(-3, 5, 6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xeef2ff, 0.55);
      fill.position.set(4, 1.5, 3);
      scene.add(fill);
      const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
      rimLight.position.set(1, 3, -5);
      scene.add(rimLight);

      const camera = new THREE.PerspectiveCamera(24, 0.72, 0.1, 50);
      camera.position.set(0, 1.92, 11.6);
      camera.lookAt(0, 1.92, 0);

      const rig: Rig = buildCharacter(THREE);
      scene.add(rig.root);

      const resize = () => {
        const { width, height } = box.current!.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(box.current);
      resize();

      const onMove = (e: PointerEvent) => {
        const r = box.current!.getBoundingClientRect();
        live.px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
        live.py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.25)) / (window.innerHeight * 0.5)));
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let last = performance.now();
      let walk = 0, phase = 0, dir = 1, wave = 0, t = 0;
      let nextBlink = 2, blink = 0, nextWave = 7, waveUntil = 0, still = 0, lead = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt;

        /* ── Walking follows the scroll ── */
        const speed = Math.abs(scroll.v) / Math.max(dt, 0.001); // px / s
        const moving = speed > 26;
        if (moving) { dir = scroll.v > 0 ? 1 : -1; still = 0; } else still += dt;
        walk = lerp(walk, moving ? 1 : 0, 1 - Math.exp(-dt * (moving ? 12 : 7)));
        phase += Math.min(15, Math.max(moving ? 6 : 0, speed * 0.011)) * dt;

        const { body, hips, torso, head, legL, legR, armL, armR, eyeL, eyeR, tail, root } = rig;
        const k = 1 - Math.exp(-dt * 10);

        /* Turn side-on while walking, face the visitor when stopped */
        body.rotation.y = lerp(body.rotation.y, dir * 1.2 * walk, 1 - Math.exp(-dt * 9));
        /* She leans a little into the direction of travel */
        lead = lerp(lead, moving ? dir * Math.min(1, speed / 1400) : 0, 1 - Math.exp(-dt * 4));
        root.position.x = lead * 0.32;

        const s = Math.sin(phase), c = Math.cos(phase);
        const idle = 1 - walk;
        hips.position.y = 1.64 + (Math.abs(s) * 0.06 - 0.04) * walk + Math.sin(t * 2) * 0.008 * idle;
        hips.rotation.z = Math.sin(t * 0.9) * 0.022 * idle;
        torso.rotation.x = 0.07 * walk;
        torso.rotation.z = -hips.rotation.z * 0.6 + Math.sin(phase) * 0.03 * walk;
        torso.scale.y = 1 + Math.sin(t * 2) * 0.008 * idle;

        legL.hip.rotation.x = -s * 0.52 * walk;
        legR.hip.rotation.x = s * 0.52 * walk;
        legL.knee.rotation.x = Math.max(0, c) * 0.85 * walk;
        legR.knee.rotation.x = Math.max(0, -c) * 0.85 * walk;

        /* ── Wave: on hover, and every so often while she waits ── */
        if (live.hover) waveUntil = t + 0.4;
        if (still > nextWave) { waveUntil = t + 1.8; still = 0; nextWave = 8 + Math.random() * 6; }
        wave = lerp(wave, t < waveUntil && !moving ? 1 : 0, k);

        armL.shoulder.rotation.x = s * 0.5 * walk;
        armL.shoulder.rotation.z = -0.07 * idle + Math.sin(t * 1.3) * 0.015 * idle;
        armL.elbow.rotation.x = -(0.25 + Math.max(0, s) * 0.3) * walk - 0.06 * idle;
        armR.shoulder.rotation.x = -s * 0.5 * walk * (1 - wave);
        armR.shoulder.rotation.z = lerp(0.07 * idle, 2.45, wave);
        armR.elbow.rotation.x = -(0.25 + Math.max(0, -s) * 0.3) * walk - 0.06 * idle;
        armR.elbow.rotation.z = (0.55 + Math.sin(t * 11) * 0.38) * wave;

        tail.rotation.x = -s * 0.08 * walk;
        tail.rotation.z = Math.sin(t * 1.6) * 0.03 + c * 0.05 * walk;

        /* ── Eyes on the visitor ── */
        head.rotation.y = lerp(head.rotation.y, live.px * 0.5 * idle - body.rotation.y * 0.28, k);
        head.rotation.x = lerp(head.rotation.x, live.py * 0.22 * idle, k);
        head.rotation.z = Math.sin(t * 0.7) * 0.035 * idle + 0.08 * wave;

        nextBlink -= dt;
        if (nextBlink < 0) { blink = 0.14; nextBlink = 2.4 + Math.random() * 3; }
        blink = Math.max(0, blink - dt);
        const open = blink > 0 ? 0.12 : 1;
        eyeL.ball.scale.y = lerp(eyeL.ball.scale.y, 1.12 * open, 0.5);
        eyeR.ball.scale.y = eyeL.ball.scale.y;

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        scene.traverse((o) => {
          const m = o as THREE_NS.Mesh;
          if (m.isMesh) { m.geometry.dispose(); (m.material as THREE_NS.Material).dispose(); }
        });
        renderer.dispose();
      };
    });

    return () => { dead = true; cancelAnimationFrame(raf); cleanup(); };
  }, []);

  return (
    <div ref={box} className="persona">
      {fallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/art/maryam-front.webp" alt="Maryam" className="persona-fallback" />
      ) : (
        <canvas ref={canvas} aria-hidden />
      )}
      <button
        className="persona-hit"
        aria-label="Maryam says: hey, any questions? Go to contact"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => goTo("contact")}
      />
      <AnimatePresence>
        {hover && (
          <motion.div
            className="persona-cloud"
            initial={{ opacity: 0, scale: 0.4, y: 16, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <svg viewBox="0 0 240 150" aria-hidden>
              <path
                d="M58 104C26 106 12 78 34 62 24 36 54 18 76 32 88 8 130 6 144 28 170 12 208 30 198 58 224 64 224 100 192 104 176 118 150 112 142 106 124 120 84 120 58 104Z"
                fill="#fff" stroke="#111" strokeWidth="4" strokeLinejoin="round"
              />
              <circle cx="74" cy="126" r="9" fill="#fff" stroke="#111" strokeWidth="4" />
              <circle cx="58" cy="143" r="5" fill="#fff" stroke="#111" strokeWidth="3.5" />
            </svg>
            <span>hey, any questions?</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
