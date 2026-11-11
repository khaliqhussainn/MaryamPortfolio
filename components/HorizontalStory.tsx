"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { scroll, goTo } from "@/lib/scrollStore";
import { profile } from "@/data/content";
import Persona from "@/components/Persona";

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
   The page is as tall as the track is wide. */
export default function HorizontalStory({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("hello");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const w = wrap.current!, t = track.current!;
    let scenes: { id: string; left: number }[] = [];

    const measure = () => {
      scroll.max = Math.max(0, t.scrollWidth - window.innerWidth);
      w.style.height = `${scroll.max + window.innerHeight}px`;
      if (sky.current) sky.current.style.width = `${window.innerWidth + scroll.max * 0.35}px`;
      scenes = Array.from(t.querySelectorAll<HTMLElement>("[data-scene]")).map((el) => ({
        id: el.id,
        left: el.offsetLeft,
      }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("resize", measure);
    measure();

    let raf = 0, last = performance.now(), current = "";
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = Math.max(0, Math.min(scroll.max, window.scrollY));
      const prev = scroll.x;
      let nx = prev + (target - prev) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - nx) < 0.15) nx = target;
      scroll.x = nx;
      scroll.v = nx - prev;
      t.style.transform = `translate3d(${-nx}px,0,0)`;
      if (sky.current) sky.current.style.transform = `translate3d(${-nx * 0.35}px,0,0)`;
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
      window.removeEventListener("resize", measure);
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
      <div className="story-viewport">
        {/* Slow-moving sky */}
        <div ref={sky} className="sky" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <svg key={i} className="sky-cloud" viewBox="0 0 120 50"
              style={{ left: `${i * 7.1 + 4.5}%`, top: `${[9, 20, 13, 26, 7, 18][i % 6]}%`, width: `${[90, 130, 70, 110][i % 4]}px` }}>
              <path d="M18 44C4 44 2 28 14 25 12 12 30 6 38 16 46 2 72 4 76 18 92 10 110 24 100 36 112 40 108 46 98 44Z"
                fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          ))}
        </div>

        {/* The world */}
        <div ref={track} className="story-track">{children}</div>

        {/* She walks with you */}
        <Persona />

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
            <a className="nav-resume" href={profile.resume} target="_blank" rel="noopener noreferrer">Resume ↓</a>
          </nav>
          <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>
            {menu ? "close" : "menu"}
          </button>
          <div className="progress" aria-hidden><div ref={bar} /></div>
        </header>

        <div ref={hint} className="scroll-hint" aria-hidden>
          scroll to walk <span>→</span>
        </div>
      </div>
    </div>
  );
}
