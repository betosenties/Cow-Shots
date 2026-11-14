import HeroStory from "@/components/HeroStory";
import PackStory from "@/components/PackStory";
import { CartDrawer, Nav, Preloader } from "@/components/Chrome";
import { About, Benefits, Comparison, FlavorTrio, Footer, HowToBuy, Marquee, Product, Team } from "@/components/Sections";
import { Cursor } from "@/components/ui";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <Nav />
      <CartDrawer />
      <main>
        <HeroStory />
        <Marquee />
        <Product />
        <FlavorTrio />
        <PackStory />
        <Benefits />
        <Comparison />
        <HowToBuy />
        <Marquee inverted />
        <About />
        <Team />
        <Footer />
      </main>
    </>
  );
}
