import type { CSSProperties, ReactNode } from "react";

/* A chapter of the story. `tint` colours the ground you walk on. */
export function Scene({ id, tint, children }: { id: string; tint: string; children: ReactNode }) {
  return (
    <section id={id} data-scene className="scene" style={{ "--tint": tint } as CSSProperties}>
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

/* Chapter heading column */
export function Chapter({ no, kicker, title, text, street }: {
  no: string; kicker: string; title: ReactNode; text?: string; street?: ReactNode;
}) {
  return (
    <Col className="chapter" street={street}>
      <div>
        <p className="hand kicker">chapter {no} — {kicker}</p>
        <h2 className="chapter-title">{title}</h2>
        {text && <p className="chapter-text">{text}</p>}
      </div>
    </Col>
  );
}

const SHAPES: Record<string, ReactNode> = {
  star: <path d="M25 3l6 14 15 2-11 10 3 15-13-8-13 8 3-15L4 19l15-2z" />,
  spark: <path d="M25 2c2 14 9 21 23 23-14 2-21 9-23 23-2-14-9-21-23-23 14-2 21-9 23-23z" />,
  heart: <path d="M25 44C6 30 3 20 8 12c5-7 14-5 17 2 3-7 12-9 17-2 5 8 2 18-17 32z" />,
  flower: (
    <>
      <circle cx="25" cy="11" r="9" /><circle cx="39" cy="21" r="9" /><circle cx="34" cy="37" r="9" />
      <circle cx="16" cy="37" r="9" /><circle cx="11" cy="21" r="9" /><circle cx="25" cy="25" r="7" fill="#fff" />
    </>
  ),
  blob: <path d="M26 4c12-2 21 8 20 20s-10 22-22 22S3 37 4 25 14 6 26 4z" />,
};

/* A little sticker doodle. Position it with `style`. */
export function Doodle({ shape, color, size = 44, spin, float, style }: {
  shape: keyof typeof SHAPES | "squiggle"; color: string; size?: number; spin?: boolean; float?: boolean; style?: CSSProperties;
}) {
  const cls = `doodle ${spin ? "spin" : ""} ${float ? "float" : ""}`;
  if (shape === "squiggle")
    return (
      <svg className={cls} viewBox="0 0 90 24" width={size * 2} style={style} aria-hidden>
        <path d="M4 12c8-12 14-12 20 0s14 12 20 0 14-12 20 0 14 12 20 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg className={cls} viewBox="0 0 50 50" width={size} height={size} style={style} aria-hidden
      fill={color} stroke="#111" strokeWidth="2.5" strokeLinejoin="round">
      {SHAPES[shape]}
    </svg>
  );
}

/* Tuft of grass / flower standing on the ground line */
export function Sprout({ left, color = "#BBFFC6", flower }: { left: string; color?: string; flower?: string }) {
  return (
    <svg className="prop sprout" viewBox="0 0 60 70" style={{ left }} aria-hidden>
      <path d="M30 70V34M30 70C24 58 14 54 6 56M30 70c6-12 16-16 24-14" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 60C22 52 12 50 6 56c8 6 18 6 24 4zM30 60c8-8 18-10 24-4-8 6-18 6-24 4z" fill={color} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
      {flower && (
        <g fill={flower} stroke="#111" strokeWidth="2.5">
          <circle cx="30" cy="14" r="8" /><circle cx="42" cy="24" r="8" /><circle cx="36" cy="38" r="8" />
          <circle cx="24" cy="38" r="8" /><circle cx="18" cy="24" r="8" /><circle cx="30" cy="27" r="6" fill="#fff" />
        </g>
      )}
    </svg>
  );
}

/* Wooden signpost standing on the ground line */
export function Signpost({ text, color, left = "50%" }: { text: string; color: string; left?: string }) {
  return (
    <div className="prop signpost" style={{ left }}>
      <span style={{ background: color }}>{text}</span>
      <i />
    </div>
  );
}
