/* ════════════════════════════════════════════════════════════════
   ALL SITE CONTENT LIVES HERE.
   To add something new: copy the last { ... } block in a list,
   paste it underneath, and change the values. That's it.
   ════════════════════════════════════════════════════════════════ */

export const profile = {
  name: "Maryam Nadeem",
  role: "Software Developer",
  focus: "Forward Deployed Engineering",
  location: "Karachi, Pakistan",
  email: "maryamdev78@gmail.com",
  resume: "/resume.pdf",
  summary:
    "I'm a software developer heading toward Forward Deployed Engineer roles. I've delivered two production RAG websites for a Saudi Arabia-based client, and I build my own products across creator tools, business chatbots and product distribution.",
  socials: [
    { label: "GitHub", href: "https://github.com/maryumxx" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/maryam-nadeem-86534b247/" },
    { label: "X / Twitter", href: "https://x.com/mrymonx" },
  ],
};

export const stats = [
  { value: "2", label: "production RAG sites shipped" },
  { value: "3", label: "indie products launched" },
  { value: "17+", label: "websites designed & built" },
];

export const education = [
  {
    title: "BS Computer Science",
    place: "Hamdard University",
    period: "Nov 2021 – Jun 2025",
    note: "CGPA 3.38 / 4.00 · first-semester merit scholarship",
  },
  {
    title: "Generative AI & Metaverse 3.0",
    place: "GIAIC",
    period: "Mar 2024 – Present",
    note: "AI agents, RAG and spec-driven development · mentored fellow participants",
  },
];

/* ── Indie products (the ones with mascots) ─────────────────────── */
export const products = [
  {
    name: "GoatBoard",
    tagline: "Product discovery & launch platform",
    url: "https://goatboard.lol",
    urlLabel: "goatboard.lol",
    mascot: "/art/goat.webp", // image in /public, or "" for none
    mascotSays: "launch day!",
    color: "#FFC75A",
    points: [
      "Product showcases, community voting and leaderboards",
      "Founder growth tools and startup distribution services",
      "Promotional campaigns with live reporting — earned its first $130",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    name: "XMetrix",
    tagline: "AI-powered creator platform for X",
    url: "https://xmetrix.space",
    urlLabel: "xmetrix.space",
    mascot: "/art/panther.webp",
    mascotSays: "post time.",
    color: "#BBFFC6",
    points: [
      "AI post and bio generation with content scheduling",
      "Analytics and customizable share cards",
      "X OAuth, subscription billing and cloud media storage",
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Cloudflare Workers"],
  },
  {
    name: "Myka AI",
    tagline: "Subscription chatbot platform",
    url: "https://myka-ai.vercel.app",
    urlLabel: "myka-ai.vercel.app",
    mascot: "",
    mascotSays: "ask me!",
    color: "#BFAAEA",
    points: [
      "Turns business PDFs into website chatbots",
      "Lemon Squeezy subscription billing",
      "Works with WordPress, Next.js, React, HTML and Webflow",
    ],
    stack: ["Cohere", "PHP", "Neon PostgreSQL", "Lemon Squeezy"],
  },
];

/* ── Experience, oldest first (the story walks forward in time) ─── */
export const experience = [
  {
    role: "Frontend Developer Intern",
    company: "Encryptix",
    period: "Jun – Jul 2023",
    sign: "2023",
    color: "#B9FDF9",
    points: [
      "Built three frontend projects with HTML and CSS",
      "Turned client requirements into responsive, working interfaces",
    ],
  },
  {
    role: "Freelance Web Designer & Developer",
    company: "Self-employed",
    period: "Ongoing",
    sign: "Freelance",
    color: "#FFC75A",
    points: [
      "Responsive websites for healthcare, marketing, cybersecurity and software clients",
      "Designed in Figma, built with modern frontend tools",
    ],
  },
  {
    role: "AI-Native Developer",
    company: "Outsource Leap",
    period: "Jun – Sep 2026",
    sign: "2026",
    color: "#BFAAEA",
    points: [
      "Built a project management system, a Flutter fitness app and an interactive 3D motion website",
      "Ran black-box testing and QA across client projects",
      "Used AI-assisted, spec-driven workflows to ship faster",
    ],
  },
  {
    role: "Indie Hacker",
    company: "Independent",
    period: "Ongoing",
    sign: "Now",
    color: "#DCFF73",
    points: [
      "Built and launched GoatBoard, XMetrix and Myka AI",
      "Product discovery, creator growth and AI customer support",
    ],
  },
];

/* ── Engineering deep-dives ─────────────────────────────────────── */
export const builds = [
  {
    name: "AI-Native Book & RAG System",
    meta: "2026",
    color: "#B9FDF9",
    text: "A content-grounded chatbot with text-selection question answering. This work became two production RAG websites for a Saudi Arabia-based client.",
    stack: ["Docusaurus", "FastAPI", "OpenAI Agents SDK", "ChatKit", "Neon PostgreSQL", "Qdrant Cloud"],
  },
  {
    name: "Farmware",
    meta: "Project Lead · 2024 – 2025",
    color: "#BBFFC6",
    text: "A cattle health app. I led development, UI/UX, testing and team coordination, and designed questionnaire-based health data collection for symptom-based disease prediction.",
    stack: ["Ionic Angular", "TypeScript", "SQL", "Python"],
  },
];

/* ── Gallery ────────────────────────────────────────────────────── */
export type GalleryCategory = "UI/UX Design" | "Development" | "Open Source" | "SQA";

export interface GalleryItem {
  title: string;
  subtitle: string;
  category: GalleryCategory;
  year: string;
  tags: string[];
  img: string; // screenshot, or a logo when logoOnly is true
  link: string; // "" = no link yet
  logoOnly?: boolean; // true = show the image as a small centered logo
}

/* SQA — websites I tested. Card shows just the logo and opens the
   GitHub repo with the test documentation.
   To add one: copy the block, paste below, change the values. */
export const sqaProjects: GalleryItem[] = [
  {
    title: "usectl",
    subtitle: "Black-box testing & QA documentation",
    category: "SQA",
    year: "2026",
    tags: ["Test Cases", "Bug Reports"],
    img: "/usectl.png", // upload to /public
    link: "https://github.com/maryumxx", // TODO: replace with the test-docs repo URL
    logoOnly: true,
  },
];

/* Open source contributions.
   To add one: copy the commented block, remove the slashes, change the values. */
export const openSourceProjects: GalleryItem[] = [
  // {
  //   title: "Project name",
  //   subtitle: "What I contributed",
  //   category: "Open Source",
  //   year: "2026",
  //   tags: ["TypeScript", "Docs"],
  //   img: "/project-logo.png",
  //   link: "https://github.com/owner/repo/pull/1",
  //   logoOnly: true,
  // },
];

export const designAndDevProjects: GalleryItem[] = [
  { title: "Taskflow", subtitle: "Task Management App", category: "Development", year: "2026", tags: ["Next.js", "TypeScript"], img: "/images/taskflow.jpeg", link: "https://taskflowtodo.vercel.app/" },
  { title: "Comforty", subtitle: "E-Commerce Website", category: "UI/UX Design", year: "2024", tags: ["Figma", "e-Commerce"], img: "/images/comforty.jpeg", link: "https://mxryxms-capstone-project.vercel.app/" },
  { title: "Farmware App", subtitle: "Cow Health Checker", category: "UI/UX Design", year: "2025", tags: ["Figma", "Agriculture"], img: "/images/farmwareapp.jpeg", link: "" },
  { title: "Azeeza Hussaini Hospital", subtitle: "Hospital Website", category: "UI/UX Design", year: "2025", tags: ["Figma", "Healthcare"], img: "/images/azeezahussaini.jpeg", link: "https://www.figma.com/design/4EfbCDqZt9RJjZnXeup81u/Aziza-Hussaini-Hospital" },
  { title: "Software Agency", subtitle: "Agency Website Design", category: "UI/UX Design", year: "2024", tags: ["Figma", "Agency"], img: "/images/softwareagency.jpeg", link: "https://www.figma.com/design/kDwlCYeR6LZREyCwoyIRqG/Software-Agency" },
  { title: "Tax Lodge Online", subtitle: "E-Commerce Design", category: "UI/UX Design", year: "2024", tags: ["Figma", "Finance"], img: "/images/taxlodge.jpeg", link: "https://www.figma.com/design/cncW1woUEVgtBqhe3SZ19I/Tax-Lodge-Online" },
  { title: "Wrap n Snap", subtitle: "E-Commerce UI Design", category: "UI/UX Design", year: "2023", tags: ["Figma", "e-Commerce"], img: "/images/wrapnsnap.jpeg", link: "https://www.figma.com/design/CNhhiIo7PSMXXguN4lqIxz/Portfolio-Template--Community-?node-id=101-412" },
  { title: "Landscape", subtitle: "Dynamic Blog Website", category: "Development", year: "2024", tags: ["Next.js", "Blog"], img: "/images/landscape.jpeg", link: "https://dynamic-blog-green.vercel.app/" },
  { title: "Exclusive", subtitle: "E-Commerce Website", category: "Development", year: "2024", tags: ["Tailwind CSS", "e-Commerce"], img: "/images/exclusive.jpeg", link: "https://mxryxms-nextjs-ecommerce.vercel.app/" },
  { title: "Paws n Play", subtitle: "E-Commerce Website", category: "Development", year: "2023", tags: ["Tailwind CSS", "e-Commerce"], img: "/images/pawsnplay.jpeg", link: "https://furry-website.vercel.app/" },
  { title: "Travio", subtitle: "Travel Website", category: "Development", year: "2023", tags: ["HTML", "CSS"], img: "/images/travio.jpeg", link: "https://first-next-app-ten-theta.vercel.app/" },
  { title: "Readie", subtitle: "Educational Website", category: "Development", year: "2023", tags: ["HTML", "CSS"], img: "/images/readie.jpeg", link: "https://readie-iota.vercel.app/" },
  { title: "Photowall", subtitle: "Digital Photo Exhibition", category: "Development", year: "2023", tags: ["HTML", "CSS"], img: "/images/photowall.jpeg", link: "https://artwall-topaz.vercel.app/" },
  { title: "Mathex", subtitle: "Math Tool", category: "Development", year: "2023", tags: ["JavaScript", "CSS"], img: "/images/mathex.jpeg", link: "https://mathex-gilt.vercel.app/" },
  { title: "Prosume", subtitle: "Resume Builder", category: "Development", year: "2023", tags: ["JavaScript", "CSS"], img: "/images/prosume.jpeg", link: "https://resumebuilder-sepia.vercel.app/" },
  { title: "Personal Portfolio 2", subtitle: "Portfolio Website", category: "Development", year: "2023", tags: ["HTML", "CSS"], img: "/images/personalportfolio2.jpeg", link: "https://mxryxms-personal-portfolio.vercel.app/" },
  { title: "Portfolio (First)", subtitle: "Portfolio Website", category: "Development", year: "2022", tags: ["HTML", "CSS"], img: "/images/portfoliofirst.jpeg", link: "https://portfolio-maryam-nadeem.vercel.app/" },
];

/* ── Skills ─────────────────────────────────────────────────────── */
export const skills = [
  { group: "Languages", color: "#DCFF73", items: ["Python", "TypeScript", "JavaScript", "PHP", "SQL", "HTML", "CSS"] },
  { group: "Web & Data", color: "#B9FDF9", items: ["Next.js", "FastAPI", "Prisma", "SQLModel", "Neon PostgreSQL", "Tailwind CSS", "Flutter", "Ionic Angular"] },
  { group: "AI & Integrations", color: "#BFAAEA", items: ["LLMs", "RAG", "Cohere", "OpenAI Agents SDK", "ChatKit", "MCP", "Qdrant Cloud", "Better Auth", "JWT"] },
  { group: "Delivery", color: "#FFC75A", items: ["Requirements translation", "Black-box testing", "Quality assurance", "Git / GitHub", "Figma", "Spec-driven development"] },
];
