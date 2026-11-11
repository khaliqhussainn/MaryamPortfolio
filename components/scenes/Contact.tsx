"use client";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { profile } from "@/data/content";
import { goTo } from "@/lib/scrollStore";
import { Scene, Col, Chapter, Sprout, Doodle, Signpost } from "./Bits";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: form.name, from_email: form.email, subject: `Portfolio message from ${form.name}`, message: form.message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <Scene id="contact" tint="#DCFF73">
      <Chapter
        no="07" kicker="the end (or the start?)"
        title={<>let&apos;s build<br />something <mark style={{ background: "#DCFF73" }}>together</mark></>}
        text="Got a project, a role, or just a question? My inbox is open."
        street={<><Sprout left="24%" flower="#FF5CAB" /><Sprout left="72%" /></>}
      />
      <Col
        street={<>
          <Signpost text="say hi!" color="#FF5CAB" left="50%" />
          <Sprout left="14%" flower="#BFAAEA" />
        </>}
      >
        <form className="card contact-card" onSubmit={submit}>
          {status === "sent" ? (
            <div className="sent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/maryam-laugh.webp" alt="" />
              <h3>Got it — thank you!</h3>
              <p>I&apos;ll get back to you soon.</p>
              <button type="button" className="btn" onClick={() => setStatus("idle")}>Send another</button>
            </div>
          ) : (
            <>
              <div className="row">
                <label>Your name
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                </label>
                <label>Your email
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                </label>
              </div>
              <label>Message
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your idea…" />
              </label>
              <div className="contact-foot">
                <button className="btn btn-pink" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send message →"}
                </button>
                {status === "error" && (
                  <span className="form-error">That didn&apos;t send. Email me at <a href={`mailto:${profile.email}`}>{profile.email}</a> instead.</span>
                )}
              </div>
            </>
          )}
        </form>
      </Col>
      <Col
        className="outro"
        street={<>
          <Doodle shape="heart" color="#FF5CAB" size={48} float style={{ left: "18%", bottom: "50%" }} />
          <Doodle shape="star" color="#FFC75A" size={40} spin style={{ left: "66%", bottom: "62%" }} />
          <Sprout left="40%" flower="#2FE3F8" /><Sprout left="82%" color="#BBFFC6" />
        </>}
      >
        <div className="outro-inner">
          <a className="email-pill" href={`mailto:${profile.email}`}>{profile.email}</a>
          <div className="socials">
            {profile.socials.map((s, i) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ background: ["#B9FDF9", "#BFAAEA", "#FFC75A"][i % 3] }}>{s.label} ↗</a>
            ))}
          </div>
          <p className="hand thanks">thanks for walking with me!</p>
          <button className="btn" onClick={() => goTo("hello")}>↺ walk it again</button>
          <p className="copyright">© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </Col>
    </Scene>
  );
}
