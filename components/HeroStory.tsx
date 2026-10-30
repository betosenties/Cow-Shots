"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { frame } from "@/lib/store";
import { Magnetic } from "./ui";
import { brand, formatPrice, pack, story as chapters } from "@/lib/content";
import SceneBoundary from "./three/SceneBoundary";

const ShotScene = dynamic(() => import("./three/ShotScene"), { ssr: false });

export default function HeroStory() {
  const root = useRef<HTMLElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // stop rendering the 3D stage once it has scrolled out of view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      frame.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      frame.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);

    const splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      // scroll progress feeds the 3D choreography
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => (frame.progress = self.progress),
      });

      // intro: oversized letters rise after the preloader
      [back.current, front.current].forEach((el, i) => {
        const s = SplitText.create(el!.querySelector("span")!, { type: "chars", mask: "chars" });
        splits.push(s);
        gsap.from(s.chars, { yPercent: 115, duration: 1.4, ease: "expo.out", stagger: 0.06, delay: 1.95 + i * 0.12 });
      });

      // the giant wordmark parts and fades as the story begins
      const exit = { trigger: root.current, start: "top top", end: "18% top", scrub: true };
      gsap.to(back.current, { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: exit });
      gsap.to(front.current, { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: exit });

      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll("[data-reveal]"),
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 70%", end: "top 30%", scrub: 0.6 },
          },
        );
        gsap.to(el.querySelector("[data-num]"), {
          yPercent: -60,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, root);

    return () => {
      window.removeEventListener("pointermove", onMove);
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, []);

  return (
    <section id="top" ref={root} className="weave relative text-cream">
      {/* sticky stage: wordmark behind, 3D shot, outline wordmark in front */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          ref={back}
          className="pointer-events-none absolute inset-x-0 top-[12%] text-center font-display text-[30vw] leading-none tracking-tight md:top-[5%] md:text-[24vw]"
        >
          <span className="inline-block">COW</span>
        </div>
        <div className="absolute inset-0">
          <SceneBoundary
            fallback={
              <div className="grid h-full place-items-center">
                <img src="brand/bottle-vainilla.jpg" alt="Botella de COW SHOTS" className="h-[50vh] rounded-[2rem] object-cover" />
              </div>
            }
          >
            <ShotScene active={active} />
          </SceneBoundary>
        </div>
        <div
          ref={front}
          className="text-outline pointer-events-none absolute inset-x-0 bottom-[14%] text-center font-display text-[30vw] leading-none tracking-tight md:-bottom-[2%] md:text-[24vw]"
        >
          <span className="inline-block">SHOTS</span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(19,42,102,0.55)_100%)]" />
      </div>

      <div className="relative z-10 -mt-[100svh]">
        {/* hero overlay */}
        <div className="flex h-svh flex-col justify-end px-4 pb-6 md:px-8 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-sm">
              <p className="mb-2 font-display text-2xl tracking-wide text-cream">{brand.slogan.toUpperCase()}</p>
              <p className="text-sm leading-relaxed text-cream/80">
                Calostro bovino <strong className="text-cream">líquido y listo para tomar</strong>, en sabores{" "}
                <strong className="text-cream">Vainilla</strong> y <strong className="text-cream">Chocolate</strong>.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-cream/70 md:flex">
                <span className="relative h-10 w-px overflow-hidden bg-cream/25">
                  <motion.span
                    className="absolute inset-x-0 top-0 h-1/2 bg-cream"
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  />
                </span>
                Desliza
              </span>
              <a href="#producto">
                <Magnetic className="rounded-full bg-cream px-7 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-cobalt">
                  Comprar · {formatPrice(pack.price)} →
                </Magnetic>
              </a>
            </div>
          </motion.div>
        </div>

        {/* scroll-driven story */}
        <div id="story">
          {chapters.map((c) => (
            <article
              key={c.n}
              data-chapter
              className="mx-auto flex min-h-svh max-w-[1400px] items-center px-4 md:px-8"
            >
              <div className="relative w-full md:w-1/2">
                <span
                  data-num
                  className="text-outline pointer-events-none absolute -top-24 left-0 font-display text-[38vw] leading-none opacity-20 md:-top-32 md:text-[16vw]"
                >
                  {c.n}
                </span>
                <div className="relative rounded-[2rem] bg-cobalt-deep/40 p-6 backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-none">
                  <p data-reveal className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cream/60">
                    {c.n} · {c.kicker}
                  </p>
                  <h2 data-reveal className="font-display text-[13vw] uppercase leading-[0.88] [text-wrap:balance] md:text-[5.6vw]">
                    {c.title}
                  </h2>
                  <p data-reveal className="mt-6 max-w-md text-base leading-relaxed text-cream/80 md:text-lg">
                    {c.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
