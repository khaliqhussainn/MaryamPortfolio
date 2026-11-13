"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { scroll, goTo, intro, INTRO } from "@/lib/scrollStore";
import { profile } from "@/data/content";
import Persona from "@/components/Persona";
import { SceneryDefs, Meadow, Clouds, Petals } from "@/components/Scenery";

const NAV = [
  { id: "about", label: "About" },
  { id: "products", label: "Products" },
  { id: "journey", label: "Journey" },
  { id: "builds", label: "Builds" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/* Vertical scroll (wheel, touch, keys) drives a horizontal track.
   The page is as tall as the track is wide. Each background layer
   moves at its own speed, so the world has depth. */
export default function HorizontalStory({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const clouds = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const petals = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("hello");
  const [menu, setMenu] = useState(false);
  const [trackW, setTrackW] = useState(0);

  useEffect(() => {
    const w = wrap.current!, t = track.current!;
    const layers: [HTMLDivElement | null, number][] = [
      [clouds.current, 0.2], [far.current, 0.32], [mid.current, 0.58], [petals.current, 0.78],
    ];
    let scenes: { id: string; left: number }[] = [];

    const measure = () => {
      scroll.max = Math.max(0, t.scrollWidth - window.innerWidth);
      w.style.height = `${scroll.max + window.innerHeight}px`;
      for (const [el, k] of layers) if (el) el.style.width = `${window.innerWidth + scroll.max * k + 40}px`;
      scenes = Array.from(t.querySelectorAll<HTMLElement>("[data-scene]")).map((el) => ({
        id: el.id,
        left: el.offsetLeft,
      }));
    };
    const sync = () => { measure(); setTrackW(t.scrollWidth); };
    const ro = new ResizeObserver(sync);
    ro.observe(t);
    window.addEventListener("resize", sync);
    measure();
    if (window.scrollY > 2) intro.phase = "out";

    let raf = 0, last = performance.now(), current = "";
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let target = Math.max(0, Math.min(scroll.max, window.scrollY));

      /* opening: first scroll makes her hop out of the hut; the world waits for the crouch */
      intro.t += dt;
      if ((intro.phase === "home" || intro.phase === "returning") && target > 2) { intro.phase = "leaving"; intro.t = 0; }
      if (intro.phase === "leaving") {
        if (intro.t < INTRO.crouch) target = scroll.x;
        if (intro.t >= INTRO.crouch + INTRO.air) { intro.phase = "out"; intro.t = 0; intro.still = 0; }
      } else if (intro.phase === "out") {
        intro.still = target < 1 && scroll.x < 1 ? intro.still + dt : 0;
        if (intro.still > 0.45) { intro.phase = "returning"; intro.t = 0; }
      } else if (intro.phase === "returning" && intro.t >= INTRO.retCrouch + INTRO.retAir) {
        intro.phase = "home"; intro.t = 0;
      }

      const prev = scroll.x;
      let nx = prev + (target - prev) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - nx) < 0.15) nx = target;
      scroll.x = nx;
      scroll.v = nx - prev;
      t.style.transform = `translate3d(${-nx}px,0,0)`;
      if (front.current) front.current.style.transform = `translate3d(${-nx}px,0,0)`;
      for (const [el, k] of layers) if (el) el.style.transform = `translate3d(${-nx * k}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${scroll.max ? nx / scroll.max : 0})`;
      if (hint.current) hint.current.style.opacity = nx > 60 ? "0" : "1";

      const probe = nx + window.innerWidth * 0.45;
      let id = scenes[0]?.id ?? "";
      for (const s of scenes) if (s.left <= probe) id = s.id;
      if (id !== current) { current = id; setActive(id); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* Sideways trackpad swipes */
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) window.scrollBy(0, e.deltaX);
    };
    /* Arrow keys */
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") window.scrollBy({ top: window.innerWidth * 0.6, behavior: "smooth" });
      if (e.key === "ArrowLeft") window.scrollBy({ top: -window.innerWidth * 0.6, behavior: "smooth" });
    };
    /* Sideways finger swipes */
    let tx = 0, ty = 0, vx = 0, horizontal: boolean | null = null;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; vx = 0; horizontal = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX, y = e.touches[0].clientY;
      if (horizontal === null && Math.abs(x - tx) + Math.abs(y - ty) > 8)
        horizontal = Math.abs(x - tx) > Math.abs(y - ty);
      if (horizontal) { vx = tx - x; window.scrollBy(0, vx * 1.4); }
      tx = x; ty = y;
    };
    const onTouchEnd = () => {
      if (horizontal && Math.abs(vx) > 4) window.scrollBy({ top: vx * 14, behavior: "smooth" });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const go = (id: string) => { setMenu(false); goTo(id); };

  return (
    <div ref={wrap} className="story-wrap">
      <SceneryDefs />
      <div className="story-viewport" data-chapter={active}>
        {/* ── Living background: sky colour shifts with each chapter ── */}
        <div className="sky-bg" aria-hidden />
        <div ref={clouds} className="layer layer-clouds" aria-hidden><Clouds /></div>
        <div ref={far} className="layer layer-far" aria-hidden />
        <div ref={mid} className="layer layer-mid" aria-hidden />
        <div ref={petals} className="layer layer-petals" aria-hidden><Petals /></div>

        {/* ── The world ── */}
        <div ref={track} className="story-track">
          <Meadow width={trackW} layer="back" />
          {children}
        </div>

        {/* She walks with you */}
        <Persona />

        {/* Flowers that brush past her feet */}
        <div ref={front} className="front-wrap" aria-hidden>
          <Meadow width={trackW} layer="front" />
        </div>

        {/* Nav */}
        <header className="topnav">
          <button className="logo" onClick={() => go("hello")} aria-label="Back to the start">
            maryam<span>.</span>
          </button>
          <nav className={`navlinks ${menu ? "open" : ""}`}>
            {NAV.map((n) => (
              <button key={n.id} className={active === n.id ? "on" : ""} onClick={() => go(n.id)}>
                {n.label}
              </button>
            ))}
            <a className="nav-resume" href={profile.resume} target="_blank" rel="noopener noreferrer">Resume ↗</a>
          </nav>
          <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>
            {menu ? "Close" : "Menu"}
          </button>
          <div className="progress" aria-hidden><div ref={bar} /></div>
        </header>

        <div ref={hint} className="scroll-hint" aria-hidden>
          Scroll to walk <span>→</span>
        </div>
      </div>
    </div>
  );
}
