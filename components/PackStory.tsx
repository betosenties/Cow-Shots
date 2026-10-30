"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { formatPrice, pack as packInfo } from "@/lib/content";
import { packFrame as pack } from "@/lib/store";
import SceneBoundary from "./three/SceneBoundary";

const PackScene = dynamic(() => import("./three/PackScene"), { ssr: false });

// each caption is visible during its slice of the scroll progress
const steps = [
  { from: 0, to: 0.12, kicker: "01", title: "Un shot.", body: `${packInfo.mlPerShot} mL de calostro bovino, listo para tomar.` },
  { from: 0.12, to: 0.3, kicker: "02", title: "Por tres.", body: `Cada paquete trae ${packInfo.shots} shots.` },
  { from: 0.3, to: 0.64, kicker: "03", title: "A la caja.", body: "Empaque de cartón con ventanas para ver tus shots." },
  { from: 0.64, to: 1.01, kicker: "04", title: "Listo para llevar.", body: `Paquete de ${packInfo.shots} · ${formatPrice(packInfo.price)}` },
];

export default function PackStory() {
  const root = useRef<HTMLElement>(null);
  const captions = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(root.current!);

    const show = (p: number) => {
      pack.progress = p;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      steps.forEach((s, i) => {
        const el = captions.current[i];
        if (!el) return;
        // fade in over the first 4% of a step and out over the last 4%
        const fadeIn = gsap.utils.clamp(0, 1, (p - s.from) / 0.04);
        const fadeOut = gsap.utils.clamp(0, 1, (s.to - p) / 0.04);
        const o = i === 0 ? fadeOut : Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 30}px)`;
      });
    };
    show(0);

    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => show(self.progress),
    });
    return () => {
      io.disconnect();
      st.kill();
    };
  }, []);

  return (
    <>
      <section id="empaque" ref={root} className="weave relative h-[420svh] text-cream">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="absolute inset-0">
            <SceneBoundary
              fallback={
                <div className="grid h-full place-items-center p-6">
                  <img src="brand/bottle-vainilla.jpg" alt="Botella de COW SHOTS" className="max-h-[70vh] rounded-[2rem]" />
                </div>
              }
            >
              <PackScene active={active} />
            </SceneBoundary>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto max-w-[1400px] px-4 md:top-28 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream/60">El empaque</p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto max-w-[1400px] px-4 md:bottom-14 md:px-8">
            <div className="relative h-40 md:h-48">
              {steps.map((s, i) => (
                <div
                  key={s.kicker}
                  ref={(el) => {
                    captions.current[i] = el;
                  }}
                  className="absolute inset-x-0 bottom-0 opacity-0"
                >
                  <p className="mb-2 font-display text-xl text-cream/50">{s.kicker}</p>
                  <h2 className="font-display text-[13vw] uppercase leading-[0.9] md:text-[6vw]">{s.title}</h2>
                  <p className="mt-2 max-w-md text-sm text-cream/80 md:text-base">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 h-px w-full bg-cream/20">
              <div ref={bar} className="h-px origin-left scale-x-0 bg-cream" />
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
