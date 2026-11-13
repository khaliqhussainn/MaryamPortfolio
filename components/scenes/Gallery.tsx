"use client";
import { useState, type CSSProperties } from "react";
import {
  designAndDevProjects, openSourceProjects, sqaProjects, folders,
  type FolderId, type GalleryCategory, type GalleryItem,
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

function Card({ item, folder, i = 0 }: { item: GalleryItem; folder?: FolderId; i?: number }) {
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
  const cls = `card shot-card ${folder ? "in-folder" : ""}`;
  const style = folder ? ({ "--tint": folders[folder].color, animationDelay: `${i * 55}ms` } as CSSProperties) : undefined;
  return item.link ? (
    <a className={cls} style={style} href={item.link} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div className={cls} style={style}>{inner}</div>
  );
}

/* A folder card: thumbnails peek out of the top; click to open / close */
function Folder({ id, items, open, onToggle }: { id: FolderId; items: GalleryItem[]; open: boolean; onToggle: () => void }) {
  const f = folders[id];
  return (
    <button
      className={`card folder ${open ? "open" : ""}`}
      style={{ "--tint": f.color } as CSSProperties}
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${f.name}: ${items.length} projects. ${open ? "Close" : "Open"} folder`}
    >
      <span className="folder-back" />
      <span className="folder-peek" aria-hidden>
        {items.slice(0, 3).map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.title} src={p.img} alt="" loading="lazy" style={{ "--n": i } as CSSProperties} />
        ))}
      </span>
      <span className="folder-front">
        <span className="folder-count">{items.length}</span>
        <b>{f.name}</b>
        <small>{f.note}</small>
        <span className="folder-cta">{open ? "Close folder ↑" : "Open folder →"}</span>
      </span>
    </button>
  );
}

export default function Gallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<FolderId[]>([]);
  const toggle = (id: FolderId) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const visible = filter === "All" ? all : all.filter((p) => p.category === filter);
  const loose = visible.filter((p) => !p.folder);
  const folderIds = (Object.keys(folders) as FolderId[]).filter((id) => visible.some((p) => p.folder === id));

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
            {loose.map((p) => <Card key={p.category + p.title} item={p} />)}
            {folderIds.map((id) => {
              const items = visible.filter((p) => p.folder === id);
              const isOpen = open.includes(id);
              return [
                <Folder key={id} id={id} items={items} open={isOpen} onToggle={() => toggle(id)} />,
                ...(isOpen ? items.map((p, i) => <Card key={id + p.title} item={p} folder={id} i={i} />) : []),
              ];
            })}
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
