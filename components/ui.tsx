"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { gsap, SplitText } from "@/lib/gsap";
import { palette } from "@/lib/palette";
import type { Flavor } from "@/lib/store";

/* Button that leans toward the pointer */
export function Magnetic({
  children,
  className = "",
  onClick,
  strength = 0.35,
  type = "button",
}: {
  type?: "button" | "submit";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });

  return (
    <motion.button
      type={type}
      data-cursor="hover"
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.94 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* Oversized headline that rises line-by-line (GSAP SplitText + ScrollTrigger) */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className = "",
  delay = 0,
  immediate = false,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      // no line mask: it would clip accents such as Ñ and Ó on tight leading
      split = SplitText.create(el, { type: "words" });
      gsap.from(split.words, {
        yPercent: 60,
        opacity: 0,
        rotate: 3,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.045,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 85%" },
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [delay, immediate]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/* Custom cursor: dot + trailing ring that grows over interactive elements */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const scale = useMotionValue(1);
  const ringScale = useSpring(scale, { stiffness: 300, damping: 20 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const hover = (e.target as HTMLElement)?.closest("a,button,[data-cursor='hover']");
      scale.set(hover ? 2.4 : 1);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, scale]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden mix-blend-difference [@media(pointer:fine)]:block">
      <motion.div style={{ x, y }} className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-cream" />
      <motion.div
        style={{ x: rx, y: ry, scale: ringScale }}
        className="absolute -left-5 -top-5 h-10 w-10 rounded-full border border-cream"
      />
    </div>
  );
}

/* 2D product illustration of a filled shot, with animated milk wave */
export function ShotIllustration({ flavor, className = "" }: { flavor: Flavor; className?: string }) {
  const fill = flavor === "chocolate" ? palette.chocolate : palette.vanilla;
  const id = `clip-${flavor}`;
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden>
      <defs>
        <clipPath id={id}>
          <path d="M42 30 L158 30 L146 236 Q145 246 135 246 L65 246 Q55 246 54 236 Z" />
        </clipPath>
        <linearGradient id={`shine-${flavor}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="200" height="260" fill="rgba(255,255,255,0.08)" />
        <g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-120 0" dur="3.2s" repeatCount="indefinite" />
          <path
            d="M0 92 Q30 80 60 92 T120 92 T180 92 T240 92 T300 92 T360 92 L360 260 L0 260 Z"
            fill={fill}
          />
        </g>
        <rect x="0" y="0" width="200" height="260" fill={`url(#shine-${flavor})`} />
        <rect x="40" y="132" width="120" height="36" fill={flavor === "chocolate" ? palette.cream : palette.cobalt} opacity="0.92" />
        <text
          x="100"
          y="157"
          textAnchor="middle"
          fontFamily="var(--font-anton), Impact"
          fontSize="20"
          letterSpacing="2"
          fill={flavor === "chocolate" ? palette.chocolate : palette.cream}
        >
          COW SHOTS
        </text>
      </g>
      <path
        d="M42 30 L158 30 L146 236 Q145 246 135 246 L65 246 Q55 246 54 236 Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.5"
      />
      <ellipse cx="100" cy="30" rx="58" ry="5" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
    </svg>
  );
}

/* Marks content that still needs real data from the brand */
export function Pending({ children = "Pendiente" }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-dashed border-current px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
      {children}
    </span>
  );
}
