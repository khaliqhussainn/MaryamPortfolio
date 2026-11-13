"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { goTo } from "@/lib/scrollStore";
import { live } from "@/lib/personaMotion";
import Puppet from "@/components/Puppet";

/* three.js only loads for the 3D version */
const Persona3D = dynamic(() => import("@/components/Persona3D"), { ssr: false });

/* Maryam walks with the scroll. 2D puppet by default; ?persona=3d shows the 3D model. */
export default function Persona() {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const is3D = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("persona") === "3d",
    () => false,
  );

  useEffect(() => { live.hover = hover; }, [hover]);

  return (
    <div ref={box} className="persona">
      {is3D ? <Persona3D box={box} /> : <Puppet box={box} />}
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
                fill="#fff" stroke="#dcc8f2" strokeWidth="3" strokeLinejoin="round"
              />
              <circle cx="74" cy="126" r="9" fill="#fff" stroke="#dcc8f2" strokeWidth="3" />
              <circle cx="58" cy="143" r="5" fill="#fff" stroke="#dcc8f2" strokeWidth="3" />
            </svg>
            <span>hey, any questions?</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
