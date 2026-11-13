/* Shared scroll state — written by HorizontalStory every frame,
   read by the 3D persona (no React re-renders involved). */
export const scroll = {
  x: 0, // current horizontal offset in px
  v: 0, // px moved in the last frame (signed)
  max: 0, // furthest the track can travel
};

/* The opening: she starts inside the hut and hops out on the first scroll.
   home → leaving (crouch, then jump) → out … and hops back in at the very start. */
export const INTRO = { crouch: 0.24, air: 0.5, land: 0.14, retCrouch: 0.12, retAir: 0.42 };
export const intro = {
  phase: "home" as "home" | "leaving" | "out" | "returning",
  t: 0, // seconds since the phase began
  still: 0, // seconds spent standing at the very start while "out"
};

/* Walk to a scene by its element id. */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const left = el.getBoundingClientRect().left + scroll.x;
  const top = Math.max(0, Math.min(scroll.max, left));
  window.scrollTo({ top, behavior: "smooth" });
}
