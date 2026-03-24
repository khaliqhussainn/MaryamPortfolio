"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

const ease = [0.25, 0.1, 0.25, 1] as const;

type Category = "All" | "UI/UX Design" | "Development";
type Size     = "small" | "medium" | "large" | "xl";

interface Project {
  id:          number;
  num:         string;
  title:       string;
  subtitle:    string;
  category:    "UI/UX Design" | "Development";
  projectType: string;
  year:        string;
  tags:        string[];
  img:         string;
  link:        string | null;
  size:        Size;
}

/* Card height in px */
const HEIGHT: Record<Size, number> = {
  small:  300,
  medium: 350,
  large:  500,
  xl:     600,
};

/* ── All 16 projects ────────────────────────────────────────── */
const projects: Project[] = [
  /* UI/UX Design — 6 */
  {
    id: 1,  num: "01", title: "Comforty",              subtitle: "E-Commerce Website",
    category: "UI/UX Design",  projectType: "Homework Project",   year: "2024",
    tags: ["UI/UX Design", "Figma", "e-Commerce"],
    img: "/images/comforty.jpeg",
    link: "https://mxryxms-capstone-project.vercel.app/",
    size: "xl",
  },
  {
    id: 9,  num: "09", title: "Wrap n Snap",            subtitle: "E-Commerce UI Design",
    category: "UI/UX Design",  projectType: "Practice Project",   year: "2023",
    tags: ["UI/UX Design", "Figma", "e-Commerce"],
    img: "/images/wrapnsnap.jpeg",
    link: "https://www.figma.com/design/CNhhiIo7PSMXXguN4lqIxz/Portfolio-Template--Community-?node-id=101-412",
    size: "medium",
  },
  {
    id: 11, num: "11", title: "Tax Lodge Online",       subtitle: "E-Commerce Design",
    category: "UI/UX Design",  projectType: "Freelance Project",  year: "2024",
    tags: ["UI/UX Design", "Figma", "Finance"],
    img: "/images/taxlodge.jpeg",
    link: "https://www.figma.com/design/cncW1woUEVgtBqhe3SZ19I/Tax-Lodge-Online",
    size: "large",
  },
  {
    id: 13, num: "13", title: "Software Agency",        subtitle: "Agency Website Design",
    category: "UI/UX Design",  projectType: "Freelance Project",  year: "2024",
    tags: ["UI/UX Design", "Figma", "Agency"],
    img: "/images/softwareagency.jpeg",
    link: "https://www.figma.com/design/kDwlCYeR6LZREyCwoyIRqG/Software-Agency",
    size: "xl",
  },
  {
    id: 15, num: "15", title: "Farmware App",           subtitle: "Cow Health Checker",
    category: "UI/UX Design",  projectType: "Final Year Project", year: "2025",
    tags: ["UI/UX Design", "Figma", "Agriculture"],
    img: "/images/farmwareapp.jpeg",
    link: null,
    size: "large",
  },
  {
    id: 16, num: "16", title: "Azeeza Hussaini Hospital", subtitle: "Hospital Website",
    category: "UI/UX Design",  projectType: "Demo Project",       year: "2025",
    tags: ["UI/UX Design", "Figma", "Healthcare"],
    img: "/images/azeezahussaini.jpeg",
    link: "https://www.figma.com/design/4EfbCDqZt9RJjZnXeup81u/Aziza-Hussaini-Hospital",
    size: "small",
  },
  /* Development — 10 */
  {
    id: 2,  num: "02", title: "Landscape",              subtitle: "Dynamic Blog Website",
    category: "Development",   projectType: "Practice Project",   year: "2024",
    tags: ["Next.js", "Blog", "Functional Website"],
    img: "/images/landscape.jpeg",
    link: "https://dynamic-blog-green.vercel.app/",
    size: "medium",
  },
  {
    id: 3,  num: "03", title: "Readie",                 subtitle: "Educational Website",
    category: "Development",   projectType: "Homework Project",   year: "2023",
    tags: ["HTML", "CSS", "Education"],
    img: "/images/readie.jpeg",
    link: "https://readie-iota.vercel.app/",
    size: "small",
  },
  {
    id: 4,  num: "04", title: "Paws n Play",            subtitle: "E-Commerce Website",
    category: "Development",   projectType: "Freelance Project",  year: "2023",
    tags: ["HTML", "Tailwind CSS", "e-Commerce"],
    img: "/images/pawsnplay.jpeg",
    link: "https://furry-website.vercel.app/",
    size: "large",
  },
  {
    id: 5,  num: "05", title: "Exclusive",              subtitle: "E-Commerce Website",
    category: "Development",   projectType: "Homework Project",   year: "2024",
    tags: ["HTML", "Tailwind CSS", "e-Commerce"],
    img: "/images/exclusive.jpeg",
    link: "https://mxryxms-nextjs-ecommerce.vercel.app/",
    size: "medium",
  },
  {
    id: 6,  num: "06", title: "Travio",                 subtitle: "Travel Website",
    category: "Development",   projectType: "Internship Project", year: "2023",
    tags: ["HTML", "CSS", "Travel"],
    img: "/images/travio.jpeg",
    link: "https://first-next-app-ten-theta.vercel.app/",
    size: "xl",
  },
  {
    id: 7,  num: "07", title: "Photowall",              subtitle: "Digital Photo Exhibition",
    category: "Development",   projectType: "Internship Project", year: "2023",
    tags: ["HTML", "CSS", "Photography"],
    img: "/images/photowall.jpeg",
    link: "https://artwall-topaz.vercel.app/",
    size: "small",
  },
  {
    id: 8,  num: "08", title: "Personal Portfolio 2",   subtitle: "Portfolio Website",
    category: "Development",   projectType: "Practice Project",   year: "2023",
    tags: ["HTML", "CSS", "Portfolio"],
    img: "/images/personalportfolio2.jpeg",
    link: "https://mxryxms-personal-portfolio.vercel.app/",
    size: "large",
  },
  {
    id: 10, num: "10", title: "Portfolio (First)",      subtitle: "Portfolio Website",
    category: "Development",   projectType: "Practice Project",   year: "2022",
    tags: ["HTML", "CSS", "Portfolio"],
    img: "/images/portfoliofirst.jpeg",
    link: "https://portfolio-maryam-nadeem.vercel.app/",
    size: "small",
  },
  {
    id: 12, num: "12", title: "Mathex",                 subtitle: "Math Tool",
    category: "Development",   projectType: "Internship Project", year: "2023",
    tags: ["HTML", "CSS", "JavaScript"],
    img: "/images/mathex.jpeg",
    link: "https://mathex-gilt.vercel.app/",
    size: "medium",
  },
  {
    id: 14, num: "14", title: "Prosume",                subtitle: "Resume Builder",
    category: "Development",   projectType: "Homework Project",   year: "2023",
    tags: ["HTML", "CSS", "JavaScript"],
    img: "/images/prosume.jpeg",
    link: "https://resumebuilder-sepia.vercel.app/",
    size: "small",
  },
  {
    id: 17, num: "17", title: "Taskflow",               subtitle: "Task Management App",
    category: "Development",   projectType: "Personal Project",   year: "2026",
    tags: ["Next.js", "TypeScript", "Productivity"],
    img: "/images/taskflow.jpeg",
    link: "https://taskflowtodo.vercel.app/",
    size: "large",
  },
];

/* ── Individual card ─────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const height = HEIGHT[project.size];

  /* Unique dark hue per card so colour fallbacks all look distinct */
  const fallback = `hsl(${330 - (project.id % 9) * 14}, 42%, ${18 + (project.id % 6) * 4}%)`;

  const cardBody = (
    <motion.div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height, borderRadius: "18px" }}
      initial={{ opacity: 0, y: 52 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: (index % 4) * 0.09, ease }}
      whileHover={{
        y: -7,
        boxShadow: "0 32px 60px rgba(107,45,69,0.28), 0 0 0 1px rgba(107,45,69,0.08)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Background image (scales on hover) ── */}
      <div
        className="absolute inset-0"
        style={{
          transform: hovered ? "scale(1.07)" : "scale(1)",
          transition: "transform 680ms cubic-bezier(0.25,0.1,0.25,1)",
          willChange: "transform",
        }}
      >
        {/* Colour placeholder (shown while image loads) */}
        <div className="absolute inset-0" style={{ background: fallback }} />
        <Image
          src={project.img}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* ── Permanent bottom gradient (keeps text/number readable) ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "60%",
          background: "linear-gradient(to top, rgba(15,3,10,0.80) 0%, rgba(15,3,10,0.0) 100%)",
        }}
      />

      {/* ── Hover overlay ── */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end p-5 md:p-6"
        animate={{ backgroundColor: hovered ? "rgba(28,4,16,0.83)" : "rgba(28,4,16,0)" }}
        transition={{ duration: 0.28 }}
      >
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
          transition={{ duration: 0.3, ease }}
        >
          {/* Project-type pill */}
          <span
            className="inline-block font-sans text-[9px] uppercase tracking-[0.22em] text-white/55 px-3 py-1 rounded-full mb-3"
            style={{ border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
          >
            {project.projectType}
          </span>

          {/* Title */}
          <h3
            className="font-serif font-bold text-white leading-tight mb-1"
            style={{ fontSize: "clamp(16px, 1.6vw, 21px)" }}
          >
            {project.title}
          </h3>

          {/* Subtitle */}
          <p className="font-sans text-white/45 text-[11px] tracking-wide mb-4">
            {project.subtitle}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-sans text-[9px] px-2.5 py-0.5 rounded-full text-white/60"
                style={{ border: "1px solid rgba(255,255,255,0.14)" }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View link hint */}
          {project.link ? (
            <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C4899A] mt-4">
              View Project →
            </p>
          ) : (
            <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/25 mt-4">
              Coming soon
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* ── Large decorative number ── */}
      <div
        className="absolute bottom-0 right-1 select-none pointer-events-none leading-none"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: "clamp(72px, 11vw, 148px)",
          lineHeight: 0.78,
          color: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.11)",
          transition: "color 0.3s ease, font-size 0.3s ease",
          paddingRight: "4px",
          paddingBottom: "2px",
          mixBlendMode: "overlay",
        }}
      >
        {project.num}
      </div>

      {/* ── Year — top left ── */}
      <div className="absolute top-4 left-4 font-sans text-[9px] uppercase tracking-[0.18em] text-white/30">
        {project.year}
      </div>

      {/* ── No-link badge ── */}
      {!project.link && (
        <div
          className="absolute top-4 right-4 font-sans text-[8px] uppercase tracking-widest text-white/35 px-2.5 py-1 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(4px)" }}
        >
          In Progress
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="break-inside-avoid mb-5 md:mb-6">
      {project.link ? (
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
    </div>
  );
}

/* ── Filter tabs ─────────────────────────────────────────────── */
const TABS: { label: Category; count: number }[] = [
  { label: "All",          count: 17 },
  { label: "UI/UX Design", count: 6  },
  { label: "Development",  count: 11 },
];

/* ── Section ─────────────────────────────────────────────────── */
export default function PortfolioSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView    = useInView(headerRef, { once: true, margin: "-60px" });
  const [filter, setFilter] = useState<Category>("All");

  const visible =
    filter === "UI/UX Design" ? projects.filter((p) => p.category === "UI/UX Design")
    : filter === "Development" ? projects.filter((p) => p.category === "Development")
    : projects;

  return (
    <section id="portfolio" className="section-cream py-24 md:py-36">
      <div className="max-w-[1760px] mx-auto px-6 md:px-12 lg:px-20">

        {/* ── Section header ── */}
        <div ref={headerRef} className="text-center mb-14 md:mb-20">

          <motion.p
            className="section-label text-[#6B2D45] mb-3"
            style={{ opacity: 0 }}
            animate={inView ? { opacity: 0.5 } : {}}
            transition={{ duration: 0.5, ease }}
          >
            PORTFOLIO
          </motion.p>

          <motion.h2
            className="font-serif font-bold text-[#4A1E30] leading-tight"
            style={{ fontSize: "clamp(28px, 4.5vw, 62px)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Let&apos;s Take a Look at
            <br className="hidden sm:block" />
            {" "}My Portfolio
          </motion.h2>

          {/* Accent line */}
          <motion.div
            className="mx-auto mt-6 mb-8"
            style={{
              width: 48, height: 1,
              background: "#6B2D45", opacity: 0.35,
              transformOrigin: "center",
            }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Filter tabs */}
          <motion.div
            className="flex items-center justify-center gap-2 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.38, ease }}
          >
            {TABS.map(({ label, count }) => (
              <button
                key={label}
                onClick={() => setFilter(label)}
                className="font-sans text-[12px] font-medium px-5 py-2 rounded-full"
                style={{
                  border: "1px solid",
                  borderColor:    filter === label ? "#6B2D45"              : "rgba(107,45,69,0.22)",
                  background:     filter === label ? "#6B2D45"              : "transparent",
                  color:          filter === label ? "#fff"                 : "rgba(74,30,48,0.55)",
                  letterSpacing:  "0.04em",
                  transition:     "all 0.22s ease",
                }}
              >
                {label}
                <span className="ml-2 text-[10px]" style={{ opacity: 0.6 }}>
                  {count}
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Masonry grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            className="columns-1 sm:columns-2 lg:columns-4"
            style={{ columnGap: "1.5rem" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease }}
          >
            {visible.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer CTA ── */}
        <motion.div
          className="mt-16 md:mt-24 flex items-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          <div className="h-px flex-1" style={{ background: "rgba(107,45,69,0.12)" }} />
          <a
            href="https://github.com/maryumxx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark flex-shrink-0"
          >
            View All on GitHub &nbsp;→
          </a>
          <div className="h-px flex-1" style={{ background: "rgba(107,45,69,0.12)" }} />
        </motion.div>

      </div>
    </section>
  );
}
