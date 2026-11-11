"use client";
import { useState } from "react";
import {
  designAndDevProjects, openSourceProjects, sqaProjects,
  type GalleryCategory, type GalleryItem,
} from "@/data/content";
import { Scene, Col, Chapter, Sprout, Doodle } from "./Bits";

const all: GalleryItem[] = [...sqaProjects, ...openSourceProjects, ...designAndDevProjects];

type Filter = "All" | GalleryCategory;
const FILTERS: Filter[] = ["All", "UI/UX Design", "Development", "Open Source", "SQA"];
const count = (f: Filter) => (f === "All" ? all.length : all.filter((p) => p.category === f).length);

const TAG_COLOR: Record<GalleryCategory, string> = {
  "UI/UX Design": "#FF5CAB",
  Development: "#2FE3F8",
  "Open Source": "#DCFF73",
  SQA: "#FFC75A",
};

function Card({ item, i }: { item: GalleryItem; i: number }) {
  const [broken, setBroken] = useState(false);
  const inner = (
    <>
      <div className={`shot ${item.logoOnly ? "logo-only" : ""}`}>
        {broken ? (
          <b className="shot-fallback">{item.title}</b>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.img} alt={item.title} loading="lazy" onError={() => setBroken(true)} />
        )}
        <span className="shot-cat" style={{ background: TAG_COLOR[item.category] }}>{item.category}</span>
      </div>
      <div className="shot-info">
        <h4>{item.title}</h4>
        <p>{item.subtitle} · {item.year}</p>
        <span className="shot-go">{item.link ? (item.category === "SQA" ? "test docs →" : "view →") : "in progress"}</span>
      </div>
    </>
  );
  const style = { "--tilt": `${[-1.2, 0.8, -0.5, 1.3][i % 4]}deg` } as React.CSSProperties;
  return item.link ? (
    <a className="card shot-card" style={style} href={item.link} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div className="card shot-card" style={style}>{inner}</div>
  );
}

export default function Gallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? all : all.filter((p) => p.category === filter);

  return (
    <Scene id="work" tint="#FF5CAB">
      <Chapter
        no="05" kicker="the gallery"
        title={<>everything<br />else I <mark style={{ background: "#FF5CAB" }}>made</mark></>}
        street={<><Sprout left="20%" flower="#FFC75A" /><Sprout left="70%" color="#DCFF73" /></>}
      />
      <Col
        className="gallery-col"
        street={<>
          <Doodle shape="star" color="#FFC75A" size={46} spin style={{ left: "12%", bottom: "52%" }} />
          <Doodle shape="heart" color="#FF5CAB" size={40} float style={{ left: "46%", bottom: "40%" }} />
          <Sprout left="30%" flower="#BFAAEA" /><Sprout left="62%" /><Sprout left="88%" flower="#2FE3F8" />
        </>}
      >
        <div className="gallery">
          <div className="filters" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                {f} <small>{count(f)}</small>
              </button>
            ))}
          </div>
          <div className="shots">
            {visible.map((p, i) => <Card key={p.category + p.title} item={p} i={i} />)}
            {visible.length === 0 && (
              <div className="card shot-empty">
                <p className="hand">first contribution landing soon…</p>
                <span>watch this space ✿</span>
              </div>
            )}
          </div>
        </div>
      </Col>
    </Scene>
  );
}
