"use client";
import { profile, stats, education, products, experience, builds, skills } from "@/data/content";
import { goTo } from "@/lib/scrollStore";
import { Scene, Col, Chapter, Doodle, Sprout, Signpost } from "./Bits";

/* ── 00 · Hello ──────────────────────────────────────────────── */
export function Hello() {
  return (
    <Scene id="hello" tint="#DCFF73">
      <Col
        className="hero"
        street={<>
          <Sprout left="46%" flower="#FF5CAB" /><Sprout left="68%" /><Sprout left="90%" flower="#FFC75A" />
        </>}
      >
        <div className="hero-copy">
          <p className="hand hero-hi">hey, salam, hello! <span className="wave">👋</span></p>
          <h1>
            I&apos;m <mark style={{ background: "#FF5CAB" }}>Maryam</mark>,<br />
            I build <mark style={{ background: "#2FE3F8" }}>things</mark> that <mark style={{ background: "#DCFF73" }}>ship</mark>.
          </h1>
          <p className="hero-role">
            {profile.role} · {profile.focus}<br />
            <span>{profile.location}</span>
          </p>
          <div className="hero-cta">
            <button className="btn btn-pink" onClick={() => goTo("about")}>Walk with me →</button>
            <a className="btn" href={`mailto:${profile.email}`}>Say hi</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden>
          <span className="blob" style={{ background: "#BFAAEA" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sticker s1" src="/art/maryam-wink.webp" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sticker s2" src="/art/maryam-laugh.webp" alt="" />
          <Doodle shape="spark" color="#FFC75A" size={54} spin style={{ left: "2%", top: "6%" }} />
          <Doodle shape="heart" color="#FF5CAB" size={40} float style={{ right: "4%", top: "2%" }} />
          <Doodle shape="star" color="#2FE3F8" size={44} float style={{ right: "0%", bottom: "6%" }} />
          <Doodle shape="squiggle" color="#FC7B1E" size={46} style={{ left: "8%", bottom: "2%" }} />
        </div>
      </Col>
    </Scene>
  );
}

/* ── 01 · About ──────────────────────────────────────────────── */
export function About() {
  return (
    <Scene id="about" tint="#BFAAEA">
      <Chapter
        no="01" kicker="who's this?"
        title={<>a little<br /><mark style={{ background: "#BFAAEA" }}>about me</mark></>}
        street={<><Sprout left="30%" flower="#DCFF73" /><Sprout left="78%" /></>}
      />
      <Col street={<><Signpost text="hi, it's me" color="#FFC75A" left="30%" /><Sprout left="74%" flower="#FF5CAB" /></>}>
        <div className="card about-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="about-face" src="/art/maryam-smile.webp" alt="Illustration of Maryam smiling" />
          <p>{profile.summary}</p>
          <p className="hand about-note">hands-on with AI, OAuth, billing &amp; databases ✿</p>
        </div>
      </Col>
      <Col street={<><Doodle shape="star" color="#FFC75A" size={42} spin style={{ left: "30%", bottom: "55%" }} /><Sprout left="60%" /></>}>
        <div className="stat-stack">
          {stats.map((s, i) => (
            <div key={s.label} className="card stat" style={{ background: ["#DCFF73", "#B9FDF9", "#FFC75A"][i % 3], "--tilt": `${[-2, 1.5, -1][i % 3]}deg` } as React.CSSProperties}>
              <b>{s.value}</b><span>{s.label}</span>
            </div>
          ))}
        </div>
      </Col>
      <Col street={<><Signpost text="school" color="#B9FDF9" left="50%" /><Sprout left="86%" flower="#FC7B1E" /></>}>
        <div className="edu-stack">
          {education.map((e, i) => (
            <div key={e.title} className="card edu" style={{ "--tilt": `${[1, -1.2][i % 2]}deg` } as React.CSSProperties}>
              <span className="pill" style={{ background: ["#FF5CAB", "#2FE3F8"][i % 2] }}>{e.period}</span>
              <h3>{e.title}</h3>
              <p className="edu-place">{e.place}</p>
              <p>{e.note}</p>
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
      <path d="M60 10v14" stroke="#111" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="9" r="7" fill="#FF5CAB" stroke="#111" strokeWidth="4" />
      <path d="M22 26h76a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H62l-20 20V90H22a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z"
        fill="#BFAAEA" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="42" cy="54" r="7" fill="#111" /><circle cx="78" cy="54" r="7" fill="#111" />
      <circle cx="44" cy="52" r="2.2" fill="#fff" /><circle cx="80" cy="52" r="2.2" fill="#fff" />
      <path d="M48 70q12 10 24 0" fill="none" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="30" cy="66" r="5" fill="#FF5CAB" opacity=".7" /><circle cx="90" cy="66" r="5" fill="#FF5CAB" opacity=".7" />
    </svg>
  );
}

export function Products() {
  return (
    <Scene id="products" tint="#FFC75A">
      <Chapter
        no="02" kicker="my little zoo"
        title={<>things I built<br />&amp; <mark style={{ background: "#FFC75A" }}>launched</mark></>}
        text="Three products of my own. Two of them came with friends."
        street={<><Sprout left="26%" flower="#2FE3F8" /><Sprout left="76%" color="#DCFF73" /></>}
      />
      {products.map((p, i) => (
        <Col
          key={p.name}
          street={
            <div className={`prop mascot mascot-${i}`}>
              <span className="mascot-says hand">{p.mascotSays}</span>
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
          <article className="card product" style={{ "--tilt": `${[-0.8, 0.6, -0.5][i % 3]}deg` } as React.CSSProperties}>
            <header style={{ background: p.color }}>
              <div>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
              </div>
              <span className="product-no hand">no.{i + 1}</span>
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
    <Scene id="journey" tint="#BBFFC6">
      <Chapter
        no="03" kicker="keep walking"
        title={<>the road<br /><mark style={{ background: "#BBFFC6" }}>so far</mark></>}
        text="Oldest stop first. Follow the signs."
        street={<><Sprout left="30%" flower="#FF5CAB" /><Sprout left="80%" /></>}
      />
      {experience.map((x, i) => (
        <Col
          key={x.role}
          street={<>
            <Signpost text={x.sign} color={x.color} left="22%" />
            <Sprout left="70%" flower={i % 2 ? "#FFC75A" : undefined} color={i % 2 ? "#BBFFC6" : "#DCFF73"} />
          </>}
        >
          <article className="card job" style={{ "--tilt": `${[0.7, -0.9, 0.5, -0.6][i % 4]}deg` } as React.CSSProperties}>
            <span className="pill" style={{ background: x.color }}>{x.period}</span>
            <h3>{x.role}</h3>
            <p className="job-co">{x.company}</p>
            <ul>{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </article>
        </Col>
      ))}
    </Scene>
  );
}

/* ── 04 · Builds ─────────────────────────────────────────────── */
export function Builds() {
  return (
    <Scene id="builds" tint="#2FE3F8">
      <Chapter
        no="04" kicker="under the hood"
        title={<>engineering<br /><mark style={{ background: "#2FE3F8" }}>deep-dives</mark></>}
        street={<><Sprout left="28%" /><Sprout left="74%" flower="#FC7B1E" /></>}
      />
      {builds.map((b, i) => (
        <Col
          key={b.name}
          street={<>
            <Doodle shape={i % 2 ? "flower" : "spark"} color={i % 2 ? "#FF5CAB" : "#FFC75A"} size={46} spin={!(i % 2)} float={!!(i % 2)} style={{ left: "58%", bottom: "50%" }} />
            <Sprout left="24%" flower={i % 2 ? undefined : "#BFAAEA"} />
          </>}
        >
          <article className="card build" style={{ "--tilt": `${[-0.7, 0.8][i % 2]}deg` } as React.CSSProperties}>
            <header style={{ background: b.color }}>
              <h3>{b.name}</h3>
              <p>{b.meta}</p>
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
    <Scene id="skills" tint="#3792DD">
      <Chapter
        no="06" kicker="what's in the bag"
        title={<>my<br /><mark style={{ background: "#B9FDF9" }}>toolbox</mark></>}
        street={<><Sprout left="30%" flower="#FFC75A" /><Sprout left="76%" /></>}
      />
      {skills.map((g, i) => (
        <Col
          key={g.group}
          street={<>
            <Doodle shape={(["star", "heart", "spark", "flower"] as const)[i % 4]} color={["#FFC75A", "#FF5CAB", "#DCFF73", "#BFAAEA"][i % 4]} size={42} float style={{ left: "40%", bottom: "48%" }} />
            <Sprout left="76%" flower={i % 2 ? "#FF5CAB" : undefined} />
          </>}
        >
          <article className="card skill" style={{ "--tilt": `${[-1, 0.8, -0.6, 1][i % 4]}deg` } as React.CSSProperties}>
            <h3 style={{ background: g.color }}>{g.group}</h3>
            <div className="chips big">{g.items.map((s) => <span key={s}>{s}</span>)}</div>
          </article>
        </Col>
      ))}
    </Scene>
  );
}
