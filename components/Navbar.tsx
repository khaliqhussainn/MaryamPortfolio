"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About",     href: "#about"     },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Skills",    href: "#skills"    },
  { label: "Contact",   href: "#contact"   },
];

function MaryamLogo() {
  return (
    <a href="#hero" className="flex items-center gap-3 no-underline group" aria-label="Maryam Nadeem home">
      {/* Monogram */}
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        {/* Stylised M/N lettermark */}
        <path
          d="M10 40 L10 14 L20 30 L26 20 L32 30 L42 14 L42 40"
          stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        {/* Script-style underline flourish */}
        <path
          d="M8 44 Q26 48 44 44"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" fill="none"
        />
      </svg>
      {/* Wordmark */}
      <div className="leading-none">
        <div className="text-white font-semibold tracking-widest text-xs uppercase" style={{ letterSpacing: "0.18em" }}>
          Maryam<span className="text-[var(--muted-rose)]">/</span>Nadeem
        </div>
        <div className="text-white/40 text-[9px] tracking-[0.22em] uppercase mt-0.5">
          Developer / Designer
        </div>
      </div>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(74,30,48,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <MaryamLogo />

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => scrollTo(link.href)}
                className="text-white/65 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 bg-transparent border-none cursor-pointer"
                style={{ letterSpacing: "0.03em" }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Resume button + mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="btn-outline-white">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="opacity-75">
                <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1.5 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Resume
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-px bg-white/75 rounded-full"
                animate={{
                  width: mobileOpen && i === 1 ? "0px" : "22px",
                  rotate: mobileOpen ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                  y: mobileOpen ? (i === 0 ? 6 : i === 2 ? -6 : 0) : 0,
                }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden"
            style={{ background: "rgba(74,30,48,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-white/75 hover:text-white text-base font-medium bg-transparent border-none cursor-pointer"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {link.label}
                </motion.button>
              ))}
              <a href="/resume.pdf" className="btn-outline-white self-start mt-2">
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
