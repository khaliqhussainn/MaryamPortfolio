"use client";
import type { CSSProperties } from "react";
import { goTo } from "@/lib/scrollStore";
import { profile } from "@/data/content";

/* The site's navigation, as a wooden signpost standing in the grass.
   Pieces are cut from art-src/signpost-reference.webp (scripts/cut-signpost.py). */
const LINKS: { label: string; id?: string; href?: string }[] = [
  { label: "About", id: "about" },
  { label: "Products", id: "products" },
  { label: "Journey", id: "journey" },
  { label: "Builds", id: "builds" },
  { label: "Work", id: "work" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
  { label: "Resume ↗", href: profile.resume },
];

const TILT = [-1.2, 2.2, -1.6, 1.1, -2, 1.6, -0.8, 2];

export default function NavPost({ className = "" }: { className?: string }) {
  return (
    <nav className={`navpost ${className}`} aria-label="Sections">
      <div className="np-post" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="np-cap" src="/art/sign/cap.webp" alt="" />
        <span className="np-pole" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="np-base" src="/art/sign/base.webp" alt="" aria-hidden />
      <ul>
        {LINKS.map((l, i) => {
          const side = i % 2 ? "left" : "right";
          const style = { "--i": i, "--tilt": `${TILT[i % TILT.length]}deg` } as CSSProperties;
          return (
            <li key={l.label} className={`np-${side}`} style={style}>
              {l.href ? (
                <a className="np-plank" href={l.href} target="_blank" rel="noopener noreferrer"><span>{l.label}</span></a>
              ) : (
                <button className="np-plank" onClick={() => goTo(l.id!)}><span>{l.label}</span></button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
