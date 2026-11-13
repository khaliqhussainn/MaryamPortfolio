import type { CSSProperties, ReactNode } from "react";

/* A chapter of the story. */
export function Scene({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} data-scene data-lazy className="scene">
      {children}
    </section>
  );
}

/* One column of a scene: content up top, street props below. */
export function Col({
  children, street, className = "", width,
}: { children?: ReactNode; street?: ReactNode; className?: string; width?: string }) {
  return (
    <div className={`col ${className}`} style={width ? { width } : undefined}>
      <div className="col-stage">{children}</div>
      <div className="col-street">{street}</div>
    </div>
  );
}

/* ── Icons (24px stroke set) ── */
const ICONS: Record<string, ReactNode> = {
  book: <path d="M3 5.8C5.6 4.3 8.7 4.3 11.6 5.8v13.6C8.7 17.9 5.6 17.9 3 19.4ZM21 5.8c-2.6-1.5-5.7-1.5-8.6 0v13.6c2.9-1.5 6-1.5 8.6 0Z" />,
  layers: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5" />,
  rocket: <path d="M14.5 4.2c3-.7 5.3-.7 5.9-.1.6.6.6 2.9-.1 5.9L15 15.3l-3.8-3.8ZM9.4 10.2 6.6 9.7 4 12.4l3.1.6M13.8 14.6l.5 2.8-2.7 2.6-.6-3.1M5.6 18.4c-.6.6-1 2.3-1 2.3s1.7-.4 2.3-1" />,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.6 4.8l-3.2 14.4" />,
  cap: <path d="M2.5 9.2 12 4.6l9.5 4.6-9.5 4.6ZM6.6 11.8v4c0 1.3 2.5 2.9 5.4 2.9s5.4-1.6 5.4-2.9v-4M21.5 9.2v5.3" />,
  briefcase: <path d="M6 7.6h12a3 3 0 0 1 3 3v6.2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6.2a3 3 0 0 1 3-3ZM9 7.6V6.4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.2M3 13h18" />,
  bolt: <path d="m13.2 2.8-8 10.8h6l-1 7.6 8-10.8h-6Z" />,
  cube: <path d="M12 2.8 3.6 7.4v9.2L12 21.2l8.4-4.6V7.4ZM3.6 7.4 12 12l8.4-4.6M12 12v9.2" />,
  mail: <path d="M5 5.5h14a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 16V8A2.5 2.5 0 0 1 5 5.5Zm-2 2 9 6.2 9-6.2" />,
  brush: <path d="M18.5 3.5 10 12l2 2 8.5-8.5a1.4 1.4 0 0 0-2-2ZM9.2 13.4c-2.3 0-3.7 1.4-3.7 3.3 0 1.2-.8 2.3-2 2.8 3.6 1.4 8.2.5 8.2-3.4Z" />,
};

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/* Rounded-square icon tile, as on the cards */
export function IconTile({ name, tint }: { name: string; tint: string }) {
  return (
    <span className="icon-tile" style={{ "--tint": tint } as CSSProperties}>
      <Icon name={name} size={22} />
    </span>
  );
}

/* Chapter heading column */
export function Chapter({ kicker, title, text, street }: {
  no?: string; kicker: string; title: ReactNode; text?: string; street?: ReactNode;
}) {
  return (
    <Col className="chapter" street={street}>
      <div className="chapter-inner">
        <p className="chapter-kicker">{kicker}</p>
        <div className="chapter-head">
          <h2 className="chapter-title">{title}</h2>
          <Doodle shape="dashes" color="#ff5cab" size={30} style={{ position: "relative", marginLeft: "0.3em", alignSelf: "flex-start", marginTop: "0.5em" }} />
        </div>
        {text && <p className="chapter-text">{text}</p>}
        <Doodle shape="arrow" color="#2a1633" size={130} style={{ position: "relative", marginTop: "1.4em", marginLeft: "1.6em" }} />
      </div>
    </Col>
  );
}

/* Hand-drawn style doodles: soft, no heavy outlines */
export function Doodle({ shape, color = "#ff5cab", size = 44, spin, float, style }: {
  shape: "heart" | "spark" | "star" | "dashes" | "squiggle" | "arrow";
  color?: string; size?: number; spin?: boolean; float?: boolean; style?: CSSProperties;
}) {
  const cls = `doodle ${spin ? "spin" : ""} ${float ? "float" : ""}`;
  if (shape === "squiggle")
    return (
      <svg className={cls} viewBox="0 0 90 24" width={size * 2} style={style} aria-hidden>
        <path d="M4 12c8-12 14-12 20 0s14 12 20 0 14-12 20 0 14 12 20 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  if (shape === "arrow")
    return (
      <svg className={cls} viewBox="0 0 170 130" width={size} style={style} aria-hidden fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8C16 70 42 92 82 86c20-3 12-28-4-20-14 7 2 36 32 42 18 4 38 3 50-4" strokeDasharray="1 8" strokeWidth="3" />
        <path d="M148 94 162 104 148 116" />
      </svg>
    );
  if (shape === "dashes")
    return (
      <svg className={cls} viewBox="0 0 50 50" width={size} style={style} aria-hidden fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round">
        <path d="M8 40 14 14M24 44 26 8M41 38 34 12" />
      </svg>
    );
  if (shape === "heart")
    return (
      <svg className={cls} viewBox="0 0 50 50" width={size} height={size} style={style} aria-hidden fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 44C6 30 3 20 8 12c5-7 14-5 17 2 3-7 12-9 17-2 5 8 2 18-17 32Z" />
        <path d="M13 17c1-3 4-4 6-3" strokeWidth="2.6" opacity=".7" />
      </svg>
    );
  const d = shape === "spark"
    ? "M25 2c2 14 9 21 23 23-14 2-21 9-23 23-2-14-9-21-23-23 14-2 21-9 23-23Z"
    : "M25 4l6 13 14 2-10 10 3 14-13-7-13 7 3-14L5 19l14-2Z";
  return (
    <svg className={cls} viewBox="0 0 50 50" width={size} height={size} style={style} aria-hidden fill={color} stroke={color} strokeWidth="3" strokeLinejoin="round">
      <path d={d} />
      <circle cx="18" cy="18" r="3" fill="#fff" stroke="none" opacity=".6" />
    </svg>
  );
}

/* Soft wooden-ish signpost standing in the grass */
export function Signpost({ text, color, left = "50%" }: { text: string; color: string; left?: string }) {
  return (
    <div className="prop signpost" style={{ left, "--tint": color } as CSSProperties}>
      <span>{text}</span>
      <i />
    </div>
  );
}
