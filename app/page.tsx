import HorizontalStory from "@/components/HorizontalStory";
import { Hello, About, Products, Journey, Builds, Skills } from "@/components/scenes/Scenes";
import Gallery from "@/components/scenes/Gallery";
import Contact from "@/components/scenes/Contact";

/* The whole site is one sideways story. Scenes play left → right. */
export default function Home() {
  return (
    <HorizontalStory>
      <Hello />
      <About />
      <Products />
      <Journey />
      <Builds />
      <Gallery />
      <Skills />
      <Contact />
    </HorizontalStory>
  );
}
