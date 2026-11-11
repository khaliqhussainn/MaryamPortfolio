/* Shared scroll state — written by HorizontalStory every frame,
   read by the 3D persona (no React re-renders involved). */
export const scroll = {
  x: 0, // current horizontal offset in px
  v: 0, // px moved in the last frame (signed)
  max: 0, // furthest the track can travel
};

/* Walk to a scene by its element id. */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const left = el.getBoundingClientRect().left + scroll.x;
  const top = Math.max(0, Math.min(scroll.max, left));
  window.scrollTo({ top, behavior: "smooth" });
}
