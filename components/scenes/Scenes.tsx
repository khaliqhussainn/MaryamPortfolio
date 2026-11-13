"use client";
import type { CSSProperties } from "react";
import { profile, stats, education, products, experience, builds, skills } from "@/data/content";
import { goTo } from "@/lib/scrollStore";
import { Scene, Col, Chapter, Doodle, Signpost, Icon, IconTile } from "./Bits";

/* soft tints used on cards (mixed from the brand palette in CSS) */
const tint = (c: string) => ({ "--tint": c }) as CSSProperties;

/* ── 00 · Hello ──────────────────────────────────────────────── */
export function Hello() {
  return (
    <Scene id="hello">
      <Col
        className="hero"
        street={<>
          <Doodle shape="spark" color="#ffc75a" size={54} spin style={{ left: "58%", bottom: "70%" }} />
          <Doodle shape="heart" color="#ff5cab" size={44} float style={{ left: "78%", bottom: "92%" }} />
          <Doodle shape="dashes" color="#7ccf5a" size={36} style={{ left: "88%", bottom: "60%" }} />
          <Doodle shape="star" color="#bfaaea" size={40} float style={{ left: "68%", bottom: "46%" }} />
        </>}
      >
        <div className="hero-copy">
          <span className="chapter-pill"><span className="wave">👋</span> Hey, Salam, Hello!</span>
          <h1>
            I&apos;m <mark className="hl-pink">Maryam</mark>,<br />
            I build <mark className="hl-cyan">things</mark> that <mark className="hl-lime">ship</mark>.
          </h1>
          <p className="hero-role">
            {profile.role} · {profile.focus}
            <span>{profile.location}</span>
          </p>
          <div className="hero-cta">
            <button className="btn btn-pink" onClick={() => goTo("about")}>Walk with me →</button>
            <a className="btn" href={`mailto:${profile.email}`}>Say hi</a>
          </div>
        </div>
      </Col>
    </Scene>
  );
}

/* ── 01 · About ──────────────────────────────────────────────── */
export function About() {
  return (
    <Scene id="about">
      <Chapter
        no="01" kicker="Who's This?"
        title={<>A Little<br /><mark className="hl-pink">About Me</mark></>}
      />
      <Col street={<Signpost text="hi, it's me" color="#ffc75a" left="30%" />}>
        <div className="card bubble about-card">
          <Doodle shape="heart" color="#ff5cab" size={46} float style={{ left: "-1em", top: "-1.5em" }} />
          <p>{profile.summary}</p>
          <p className="about-note"><Icon name="code" size={18} /> Hands-on with AI, OAuth, billing &amp; databases</p>
        </div>
      </Col>
      <Col>
        <div className="stat-stack">
          {stats.map((s, i) => (
            <div key={s.label} className="card stat" style={tint(["#dcff73", "#bfaaea", "#ffc75a"][i % 3])}>
              <IconTile name={["layers", "rocket", "code"][i % 3]} tint={["#dcff73", "#bfaaea", "#ffc75a"][i % 3]} />
              <b>{s.value}</b><span>{s.label}</span>
            </div>
          ))}
          <Doodle shape="dashes" color="#7ccf5a" size={34} style={{ right: "-1.2em", top: "-1.8em" }} />
        </div>
      </Col>
      <Col street={<Signpost text="school" color="#b9fdf9" left="50%" />}>
        <div className="edu-stack">
          {education.map((e, i) => (
            <div key={e.title} className="card edu">
              <IconTile name={i ? "briefcase" : "cap"} tint={i ? "#bfaaea" : "#ff5cab"} />
              <div>
                <span className="pill" style={tint(i ? "#bfaaea" : "#ff5cab")}>{e.period}</span>
                <h3>{e.title}</h3>
                <p className="edu-place">{e.place}</p>
                <p className="edu-note">{e.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Col>
    </Scene>
  );
}

/* ── 02 · Products (with mascots) ────────────────────────────── */
function ChatBot() {
  return (
    <svg viewBox="0 0 120 120" className="bot" aria-hidden>
      <defs>
        <linearGradient id="botg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9c8ff" /><stop offset="1" stopColor="#a98af0" /></linearGradient>
      </defs>
      <path d="M60 12v12" stroke="#7a5bd0" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="60" cy="10" r="7" fill="#ff7ab8" />
      <path d="M22 26h76a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H62l-20 20V90H22a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" fill="url(#botg)" />
      <ellipse cx="38" cy="38" rx="14" ry="6" fill="#fff" opacity=".35" />
      <circle cx="42" cy="56" r="7" fill="#2a1633" /><circle cx="78" cy="56" r="7" fill="#2a1633" />
      <circle cx="44" cy="54" r="2.4" fill="#fff" /><circle cx="80" cy="54" r="2.4" fill="#fff" />
      <path d="M48 71q12 10 24 0" fill="none" stroke="#2a1633" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="29" cy="68" r="5.5" fill="#ff8ec4" opacity=".6" /><circle cx="91" cy="68" r="5.5" fill="#ff8ec4" opacity=".6" />
    </svg>
  );
}

export function Products() {
  return (
    <Scene id="products">
      <Chapter
        no="02" kicker="My Little Zoo"
        title={<>Things I Built<br />&amp; <mark className="hl-amber">Launched</mark></>}
        text="Three products of my own. Two of them came with friends."
      />
      {products.map((p, i) => (
        <Col
          key={p.name}
          street={
            <div className={`prop mascot mascot-${i}`}>
              <span className="mascot-says">{p.mascotSays}</span>
              <div className="mascot-body">
                {p.mascot
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.mascot} alt={`${p.name} mascot`} />
                  : <ChatBot />}
              </div>
              <i className="mascot-shadow" />
            </div>
          }
        >
          <article className="card product" style={tint(p.color)}>
            <header>
              <IconTile name={["rocket", "bolt", "mail"][i % 3]} tint={p.color} />
              <div>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
              </div>
              <span className="product-no">No. {i + 1}</span>
            </header>
            <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            <div className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
            <a className="btn btn-small" href={p.url} target="_blank" rel="noopener noreferrer">{p.urlLabel} ↗</a>
          </article>
        </Col>
      ))}
    </Scene>
  );
}

/* ── 03 · Journey ────────────────────────────────────────────── */
export function Journey() {
  return (
    <Scene id="journey">
      <Chapter
        no="03" kicker="Keep Walking"
        title={<>The Road<br /><mark className="hl-mint">So Far</mark></>}
        text="Oldest stop first. Follow the signs."
      />
      {experience.map((x, i) => (
        <Col key={x.role} street={<Signpost text={x.sign} color={x.color} left="22%" />}>
          <article className="card job" style={tint(x.color)}>
            <div className="job-top">
              <IconTile name="briefcase" tint={x.color} />
              <span className="pill">{x.period}</span>
            </div>
            <h3>{x.role}</h3>
            <p className="job-co">{x.company}</p>
            <ul>{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            {i === experience.length - 1 && <Doodle shape="heart" color="#ff5cab" size={38} float style={{ right: "-0.6em", top: "-1.1em" }} />}
          </article>
        </Col>
      ))}
    </Scene>
  );
}

/* ── 04 · Builds ─────────────────────────────────────────────── */
export function Builds() {
  return (
    <Scene id="builds">
      <Chapter
        no="04" kicker="Under The Hood"
        title={<>Engineering<br /><mark className="hl-cyan">Deep-Dives</mark></>}
      />
      {builds.map((b, i) => (
        <Col
          key={b.name}
          street={<Doodle shape={i % 2 ? "star" : "spark"} color={i % 2 ? "#ff8ec4" : "#ffc75a"} size={44} spin={!(i % 2)} float={!!(i % 2)} style={{ left: "58%", bottom: "55%" }} />}
        >
          <article className="card build" style={tint(b.color)}>
            <header>
              <IconTile name={i ? "layers" : "cube"} tint={b.color} />
              <div>
                <h3>{b.name}</h3>
                <p>{b.meta}</p>
              </div>
            </header>
            <p className="build-text">{b.text}</p>
            <div className="chips">{b.stack.map((s) => <span key={s}>{s}</span>)}</div>
          </article>
        </Col>
      ))}
    </Scene>
  );
}

/* ── 06 · Skills ─────────────────────────────────────────────── */
export function Skills() {
  return (
    <Scene id="skills">
      <Chapter
        no="06" kicker="What's In The Bag"
        title={<>My<br /><mark className="hl-ice">Toolbox</mark></>}
      />
      {skills.map((g, i) => (
        <Col
          key={g.group}
          street={<Doodle shape={(["star", "heart", "spark", "dashes"] as const)[i % 4]} color={["#ffc75a", "#ff5cab", "#bfaaea", "#7ccf5a"][i % 4]} size={40} float style={{ left: "40%", bottom: "52%" }} />}
        >
          <article className="card skill" style={tint(g.color)}>
            <h3>
              <IconTile name={(["code", "layers", "bolt", "brush"] as const)[i % 4]} tint={g.color} />
              {g.group}
            </h3>
            <div className="chips big">{g.items.map((s) => <span key={s}>{s}</span>)}</div>
          </article>
        </Col>
      ))}
    </Scene>
  );
}
