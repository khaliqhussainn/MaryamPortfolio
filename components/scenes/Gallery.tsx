"use client";
import { useState } from "react";
import {
  designAndDevProjects, openSourceProjects, sqaProjects,
  type GalleryCategory, type GalleryItem,
} from "@/data/content";
import { Scene, Col, Chapter, Doodle } from "./Bits";

const all: GalleryItem[] = [...sqaProjects, ...openSourceProjects, ...designAndDevProjects];

type Filter = "All" | GalleryCategory;
const FILTERS: Filter[] = ["All", "UI/UX Design", "Development", "Open Source", "SQA"];
const count = (f: Filter) => (f === "All" ? all.length : all.filter((p) => p.category === f).length);

const TAG_COLOR: Record<GalleryCategory, string> = {
  "UI/UX Design": "#ffb3d9",
  Development: "#a4eefa",
  "Open Source": "#e6fda6",
  SQA: "#ffdf9c",
};

function Card({ item }: { item: GalleryItem }) {
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
  return item.link ? (
    <a className="card shot-card" href={item.link} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div className="card shot-card">{inner}</div>
  );
}

export default function Gallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? all : all.filter((p) => p.category === filter);

  return (
    <Scene id="work">
      <Chapter
        no="05" kicker="The Gallery"
        title={<>Everything<br />Else I <mark className="hl-pink">Made</mark></>}
      />
      <Col
        className="gallery-col"
        street={<>
          <Doodle shape="star" color="#ffc75a" size={46} spin style={{ left: "12%", bottom: "52%" }} />
          <Doodle shape="heart" color="#ff5cab" size={40} float style={{ left: "46%", bottom: "40%" }} />
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
            {visible.map((p) => <Card key={p.category + p.title} item={p} />)}
            {visible.length === 0 && (
              <div className="card shot-empty">
                <p>First contribution landing soon…</p>
                <span>watch this space ✿</span>
              </div>
            )}
          </div>
        </div>
      </Col>
    </Scene>
  );
}
