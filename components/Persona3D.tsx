"use client";
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { buildCharacter, type Rig } from "@/components/personaModel";
import { createMotion, live, stepMotion, trackPointer } from "@/lib/personaMotion";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* The three.js version of Maryam (open the site with ?persona=3d) */
export default function Persona3D({ box }: { box: React.RefObject<HTMLDivElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

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
      const untrack = trackPointer(box.current);

      const m = createMotion();
      let last = performance.now();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        stepMotion(m, dt);

        const { body, hips, torso, head, legL, legR, armL, armR, eyeL, eyeR, tail, root } = rig;
        const k = 1 - Math.exp(-dt * 10);
        const walk = m.walk, wave = m.wave, t = m.t;

        /* Turn side-on while walking, face the visitor when stopped */
        body.rotation.y = lerp(body.rotation.y, m.dir * 1.2 * walk, 1 - Math.exp(-dt * 9));
        root.position.x = m.lead * 0.32;

        const s = Math.sin(m.phase), c = Math.cos(m.phase);
        const idle = 1 - walk;
        hips.position.y = 1.64 + (Math.abs(s) * 0.06 - 0.04) * walk + Math.sin(t * 2) * 0.008 * idle;
        hips.rotation.z = Math.sin(t * 0.9) * 0.022 * idle;
        torso.rotation.x = 0.07 * walk;
        torso.rotation.z = -hips.rotation.z * 0.6 + Math.sin(m.phase) * 0.03 * walk;
        torso.scale.y = 1 + Math.sin(t * 2) * 0.008 * idle;

        legL.hip.rotation.x = -s * 0.52 * walk;
        legR.hip.rotation.x = s * 0.52 * walk;
        legL.knee.rotation.x = Math.max(0, c) * 0.85 * walk;
        legR.knee.rotation.x = Math.max(0, -c) * 0.85 * walk;

        armL.shoulder.rotation.x = s * 0.5 * walk;
        armL.shoulder.rotation.z = -0.07 * idle + Math.sin(t * 1.3) * 0.015 * idle;
        armL.elbow.rotation.x = -(0.25 + Math.max(0, s) * 0.3) * walk - 0.06 * idle;
        armR.shoulder.rotation.x = -s * 0.5 * walk * (1 - wave);
        armR.shoulder.rotation.z = lerp(0.07 * idle, 2.45, wave);
        armR.elbow.rotation.x = -(0.25 + Math.max(0, -s) * 0.3) * walk - 0.06 * idle;
        armR.elbow.rotation.z = (0.55 + Math.sin(t * 11) * 0.38) * wave;

        tail.rotation.x = -s * 0.08 * walk;
        tail.rotation.z = Math.sin(t * 1.6) * 0.03 + c * 0.05 * walk;

        /* Eyes on the visitor */
        head.rotation.y = lerp(head.rotation.y, live.px * 0.5 * idle - body.rotation.y * 0.28, k);
        head.rotation.x = lerp(head.rotation.x, live.py * 0.22 * idle, k);
        head.rotation.z = Math.sin(t * 0.7) * 0.035 * idle + 0.08 * wave;

        const open = m.blink > 0 ? 0.12 : 1;
        eyeL.ball.scale.y = lerp(eyeL.ball.scale.y, 1.12 * open, 0.5);
        eyeR.ball.scale.y = eyeL.ball.scale.y;

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        ro.disconnect();
        untrack();
        scene.traverse((o) => {
          const mesh = o as THREE_NS.Mesh;
          if (mesh.isMesh) { mesh.geometry.dispose(); (mesh.material as THREE_NS.Material).dispose(); }
        });
        renderer.dispose();
      };
    });

    return () => { dead = true; cancelAnimationFrame(raf); cleanup(); };
  }, [box]);

  return fallback ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/art/maryam-front.webp" alt="Maryam" className="persona-fallback" />
  ) : (
    <canvas ref={canvas} aria-hidden />
  );
}
