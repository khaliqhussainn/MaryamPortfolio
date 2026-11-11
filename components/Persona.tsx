"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type * as THREE_NS from "three";
import { scroll, goTo } from "@/lib/scrollStore";

/* Shared with the render loop without re-rendering React */
const live = { hover: false, px: 0, py: 0 };

/* Colours sampled from the character sheet */
const C = {
  skin: 0xf9dfd0,
  blush: 0xf2a3a8,
  lips: 0xc9656f,
  hijab: 0x17171a,
  shirt: 0xecd8c5,
  jeans: 0x425f8e,
  shoe: 0xf6f3ee,
  sole: 0xd9d2c8,
  ring: 0xc79a55,
  hair: 0x4a2a22,
  ink: 0x111111,
};

type Rig = ReturnType<typeof buildCharacter>;

function buildCharacter(THREE: typeof THREE_NS) {
  /* Three flat tones = cel shading, to match the 2D art */
  const ramp = new THREE.DataTexture(new Uint8Array([150, 215, 255]), 3, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const toon = (color: number) => new THREE.MeshToonMaterial({ color, gradientMap: ramp });
  const flat = (color: number) => new THREE.MeshBasicMaterial({ color });
  const inkMat = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });

  /* A mesh with a thick black outline (inverted hull) */
  const part = (geo: THREE_NS.BufferGeometry, mat: THREE_NS.Material, line = 0.034) => {
    const m = new THREE.Mesh(geo, mat);
    if (line > 0) {
      geo.computeBoundingBox();
      const s = geo.boundingBox!.getSize(new THREE.Vector3());
      const o = new THREE.Mesh(geo, inkMat);
      o.scale.set(1 + (2 * line) / s.x, 1 + (2 * line) / s.y, 1 + (2 * line) / s.z);
      m.add(o);
    }
    return m;
  };
  const group = (parent: THREE_NS.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const put = <T extends THREE_NS.Object3D>(parent: THREE_NS.Object3D, o: T, x = 0, y = 0, z = 0) => {
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };

  const mSkin = toon(C.skin), mShirt = toon(C.shirt), mJeans = toon(C.jeans);
  const mHijab = toon(C.hijab), mShoe = toon(C.shoe);

  const root = new THREE.Group();

  /* Soft ground shadow */
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.13 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.42, 1);
  shadow.position.y = 0.005;
  root.add(shadow);

  const body = group(root); // turns left / right
  const hips = group(body, 0, 1.64, 0); // bobs

  const pelvis = put(hips, part(new THREE.SphereGeometry(0.3, 24, 16), mJeans), 0, -0.02, 0);
  pelvis.scale.set(1.08, 0.72, 0.82);

  /* Legs with bell-bottoms */
  const leg = (side: number) => {
    const hip = group(hips, 0.165 * side, -0.06, 0);
    put(hip, part(new THREE.CylinderGeometry(0.17, 0.135, 0.8, 20), mJeans), 0, -0.4, 0);
    const knee = group(hip, 0, -0.78, 0);
    put(knee, part(new THREE.SphereGeometry(0.135, 16, 12), mJeans, 0), 0, 0, 0);
    put(knee, part(new THREE.CylinderGeometry(0.135, 0.34, 0.78, 24), mJeans), 0, -0.39, 0);
    const shoe = put(knee, part(new THREE.SphereGeometry(0.2, 20, 14), mShoe), 0, -0.76, 0.17);
    shoe.scale.set(0.72, 0.42, 1.25);
    const sole = put(knee, part(new THREE.SphereGeometry(0.2, 16, 10), toon(C.sole), 0), 0, -0.8, 0.17);
    sole.scale.set(0.7, 0.18, 1.22);
    return { hip, knee };
  };
  const legL = leg(-1), legR = leg(1);

  /* Loose button-down shirt */
  const torso = group(hips);
  const shirt = put(torso, part(new THREE.CylinderGeometry(0.3, 0.41, 1.04, 28), mShirt), 0, 0.4, 0);
  shirt.scale.z = 0.7;
  const shoulders = put(torso, part(new THREE.SphereGeometry(0.3, 24, 16), mShirt), 0, 0.88, 0);
  shoulders.scale.set(1.42, 0.5, 0.74);
  for (let i = 0; i < 4; i++)
    put(torso, new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), flat(0x9c8672)), 0.02, 0.62 - i * 0.17, 0.215 + i * 0.016);

  const arm = (side: number) => {
    const shoulder = group(torso, 0.42 * side, 0.86, 0);
    put(shoulder, part(new THREE.CapsuleGeometry(0.105, 0.42, 8, 16), mShirt), 0, -0.28, 0);
    const elbow = group(shoulder, 0, -0.56, 0);
    put(elbow, part(new THREE.CapsuleGeometry(0.1, 0.36, 8, 16), mShirt), 0, -0.24, 0);
    put(elbow, part(new THREE.CylinderGeometry(0.108, 0.108, 0.09, 16), mShirt), 0, -0.47, 0);
    put(elbow, part(new THREE.SphereGeometry(0.088, 16, 12), mSkin), 0, -0.6, 0);
    return { shoulder, elbow };
  };
  const armL = arm(-1), armR = arm(1);

  /* Scarf: wrap, knot with a gold ring, two hanging tails */
  const wrapA = put(torso, new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), mHijab), 0, 0.98, 0.03);
  wrapA.scale.set(1.5, 0.6, 1.05);
  const wrapB = put(torso, new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), mHijab), -0.04, 0.86, 0.17);
  wrapB.scale.set(1.5, 0.8, 0.7);
  const ring = put(torso, new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.017, 10, 24), toon(C.ring)), -0.1, 0.74, 0.27);
  ring.rotation.set(0.35, 0.2, 0);
  const tail = group(torso, -0.1, 0.72, 0.25);
  const tailA = put(tail, new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 8, 14), mHijab), -0.03, -0.34, 0);
  tailA.scale.set(1.15, 1, 0.42);
  tailA.rotation.z = -0.07;
  const tailB = put(tail, new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 8, 14), mHijab), 0.1, -0.24, -0.01);
  tailB.scale.set(1.1, 1, 0.42);
  tailB.rotation.z = 0.12;

  /* Head */
  const head = group(torso, 0, 1.5, 0);
  head.scale.setScalar(1.38);
  const hood = put(head, new THREE.Mesh(new THREE.SphereGeometry(0.43, 32, 24), mHijab), 0, 0.03, -0.045);
  hood.scale.set(1, 1.08, 1);
  const drape = put(head, new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), mHijab), 0, -0.36, -0.14);
  drape.scale.set(1.12, 1.1, 0.72);

  const F = { x: 0, y: -0.02, z: 0.13, rx: 0.318, ry: 0.352, rz: 0.3 };
  const face = put(head, new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mSkin), F.x, F.y, F.z);
  face.scale.set(F.rx, F.ry, F.rz);
  /* Place a feature on the face surface */
  const onFace = <T extends THREE_NS.Object3D>(o: T, x: number, y: number, lift = 0.004) => {
    const k = Math.sqrt(Math.max(0, 1 - (x / F.rx) ** 2 - ((y - F.y) / F.ry) ** 2));
    o.position.set(x, y, F.z + F.rz * k + lift);
    o.rotation.y = (x / F.rx) * 0.75;
    o.rotation.x = -((y - F.y) / F.ry) * 0.6;
    head.add(o);
    return o;
  };
  const hair = put(head, new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), toon(C.hair)), 0, 0.3, 0.24);
  hair.scale.set(0.5, 0.55, 0.6);

  const mInk = flat(C.ink);
  const eye = (side: number) => {
    const g = onFace(new THREE.Group(), 0.118 * side, 0.0);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.046, 16, 12), mInk);
    ball.scale.set(0.86, 1.12, 0.3);
    g.add(ball);
    put(g, new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), flat(0xffffff)), 0.014, 0.02, 0.014);
    const lash = put(g, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 0.008), mInk), 0.045 * side, 0.04, 0);
    lash.rotation.z = 0.5 * side;
    return { g, ball };
  };
  const eyeL = eye(-1), eyeR = eye(1);
  for (const side of [-1, 1]) {
    const brow = onFace(new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.02, 0.008), flat(0x2a1a17)), 0.12 * side, 0.115);
    brow.rotation.z = -0.05 * side;
    const blush = onFace(
      new THREE.Mesh(new THREE.CircleGeometry(0.052, 20), new THREE.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.85 })),
      0.175 * side, -0.1, 0.003,
    );
    blush.scale.set(1, 0.85, 1);
  }
  const mouth = onFace(new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.013, 8, 20, Math.PI), flat(C.lips)), 0, -0.125);
  mouth.rotation.z = Math.PI;
  mouth.scale.set(1, 0.75, 1);

  return { root, body, hips, torso, head, legL, legR, armL, armR, eyeL, eyeR, tail };
}

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
      scene.add(new THREE.AmbientLight(0xffffff, 2.1));
      const sun = new THREE.DirectionalLight(0xffffff, 1.5);
      sun.position.set(-2.5, 4, 5);
      scene.add(sun);

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
