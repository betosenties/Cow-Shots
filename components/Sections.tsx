"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { store, useStore, type Flavor } from "@/lib/store";
import {
  about,
  benefits,
  benefitsIntro,
  brand,
  business,
  competitors,
  features,
  flavors,
  formatPrice,
  pack,
  references,
  socials,
  team,
} from "@/lib/content";
import { Magnetic, Pending, SplitReveal } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 0.9, ease, delay: i * 0.08 },
});

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`mb-5 text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-cream/60" : "text-cobalt/60"}`}>
      {children}
    </p>
  );
}

/* ---------------- marquee band ---------------- */

export function Marquee({ inverted = false }: { inverted?: boolean }) {
  const words = ["Calostro bovino", "✦", "Vainilla", "✦", "Chocolate", "✦", "Listo para tomar", "✦", "Fuel. Grow. Perform.", "✦"];
  return (
    <div
      className={`overflow-hidden border-y py-5 ${
        inverted ? "border-cream/20 bg-cobalt text-cream" : "border-cobalt/15 bg-sand text-cobalt"
      }`}
    >
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-5xl uppercase md:text-7xl">
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span key={i} className={i % 4 === 2 ? "text-outline" : ""}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- product + buy ---------------- */

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 180, damping: 18 });
  const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(circle at ${((x as number) + 0.5) * 100}% ${((y as number) + 0.5) * 100}%, rgba(255,255,255,0.35), transparent 55%)`);

  return (
    <motion.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-[2.5rem] mix-blend-soft-light" />
    </motion.div>
  );
}

export function Product() {
  const flavor = useStore((s) => s.flavor);
  const [qty, setQty] = useState(1);
  const choco = flavor === "chocolate";

  return (
    <section id="producto" className="paper relative px-4 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>El producto</Eyebrow>
            <SplitReveal className="font-display text-[16vw] uppercase leading-[0.85] md:text-[9vw]">Elige tu shot.</SplitReveal>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cobalt/75">
            Calostro bovino líquido en shots individuales de {pack.mlPerShot} mL. Se vende en paquetes de {pack.shots}.
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <motion.div {...rise()}>
            <TiltCard className="overflow-hidden rounded-[2.5rem] bg-cobalt">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={flavor}
                  src={choco ? "brand/bottle-chocolate.jpg" : "brand/bottle-vainilla.jpg"}
                  alt={`Botella de COW SHOTS sabor ${flavors[flavor].name}`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                  className="aspect-[4/5] w-full object-cover"
                />
              </AnimatePresence>
              <span className="absolute left-5 top-5 rounded-full bg-cream/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cobalt">
                {pack.shots} × {pack.mlPerShot} mL
              </span>
            </TiltCard>
          </motion.div>

          <motion.div {...rise(1)} className="flex flex-col gap-8">
            <div className="inline-flex self-start rounded-full border border-cobalt/25 p-1">
              {(Object.keys(flavors) as Flavor[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => store.set({ flavor: f })}
                  className="relative rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  {flavor === f && (
                    <motion.span
                      layoutId="flavor-pill"
                      className={`absolute inset-0 rounded-full ${f === "chocolate" ? "bg-chocolate" : "bg-cobalt"}`}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                  <span className={`relative ${flavor === f ? "text-cream" : ""}`}>{flavors[f].name}</span>
                </button>
              ))}
            </div>

            <div className="relative h-[19vw] min-h-[84px] overflow-hidden lg:h-[9vw]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h3
                  key={flavor}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.7, ease }}
                  className={`absolute font-display text-[17vw] uppercase leading-[0.9] lg:text-[8vw] ${choco ? "text-chocolate" : ""}`}
                >
                  {flavors[flavor].name}
                </motion.h3>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <span className="font-display text-6xl tabular-nums md:text-7xl">{formatPrice(pack.price)}</span>
              <span className="pb-2 text-sm text-cobalt/70">
                Paquete de {pack.shots} shots · {pack.mlPerShot} mL c/u
              </span>
            </div>

            <ul className="flex flex-wrap gap-2">
              {features.map((f) => (
                <li key={f} className="rounded-full border border-cobalt/20 px-4 py-2 text-sm">
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 rounded-full border border-cobalt/25 px-5 py-3">
                <button type="button" aria-label="Quitar un paquete" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="w-5 text-center tabular-nums">{qty}</span>
                <button type="button" aria-label="Agregar un paquete" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <Magnetic
                onClick={() => store.addToCart(flavor, qty)}
                className="rounded-full bg-cobalt px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-cream"
              >
                Agregar al carrito · {formatPrice(pack.price * qty)}
              </Magnetic>
            </div>
            <p className="text-xs text-cobalt/60">Pago con {business.payments.join(", ").toLowerCase()}.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- benefits ---------------- */

const icons: Record<(typeof benefits)[number]["icon"], React.ReactNode> = {
  muscle: <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />,
  shield: <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3zm0 5v8m-4-4h8" />,
  gut: <path d="M9 3v3c0 2-3 2-3 5s3 3 6 3 6 1 6 3-2 3-4 3h-4c-2 0-3 1-3 2m6-19v3c0 1.5 2 2 2 4" />,
  leaf: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14m0 0c3-4 6-6 9-8" />,
};

export function Benefits() {
  return (
    <section id="beneficios" className="weave relative px-4 py-28 text-cream md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow light>Beneficios</Eyebrow>
            <SplitReveal className="font-display text-[15vw] uppercase leading-[0.85] md:text-[7.5vw]">
              Liquid Gold.
            </SplitReveal>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-cream/80">
            {benefitsIntro}
            <sup className="ml-1 text-cream/60">[4]</sup>
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              {...rise(i)}
              whileHover={{ y: -10 }}
              data-cursor="hover"
              className="group relative overflow-hidden rounded-[2rem] border border-cream/15 bg-cream/[0.04] p-7"
            >
              <div className="absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-700 ease-premium group-hover:scale-y-100" />
              <div className="relative flex min-h-48 flex-col justify-between gap-10 transition-colors duration-500 group-hover:text-cobalt">
                <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {icons[b.icon]}
                </svg>
                <h3 className="font-display text-3xl uppercase leading-none">{b.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs text-cream/55">
          Información basada en las referencias al final de la página. Este producto no sustituye una alimentación balanceada.
        </p>
      </div>
    </section>
  );
}

/* ---------------- why us: comparison ---------------- */

export function Comparison() {
  return (
    <section id="comparativa" className="paper relative px-4 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow>¿Por qué COW SHOTS?</Eyebrow>
            <SplitReveal className="font-display text-[14vw] uppercase leading-[0.85] md:text-[7vw]">
              Sin polvo. Sin mezclar.
            </SplitReveal>
          </div>
          <p className="max-w-md text-base leading-relaxed text-cobalt/75">
            Las otras marcas de calostro venden polvo, sobres o cápsulas, sobre todo en línea. Nosotros somos la opción
            líquida y lista para tomar, que además puedes encontrar en gimnasios, tiendas fitness y eventos deportivos.
          </p>
        </div>

        <motion.div {...rise()} className="overflow-x-auto rounded-[2rem] border border-cobalt/15 bg-cream">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-40 p-5" />
                {competitors.brands.map((b) => (
                  <th
                    key={b.name}
                    className={`p-5 align-bottom font-display text-2xl uppercase leading-none ${
                      b.ours ? "rounded-t-[1.5rem] bg-cobalt text-cream" : ""
                    }`}
                  >
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.rows.map((row, r) => (
                <tr key={row} className="border-t border-cobalt/10">
                  <th scope="row" className="p-5 text-xs font-semibold uppercase tracking-[0.15em] text-cobalt/70">
                    {row}
                  </th>
                  {competitors.brands.map((b) => (
                    <td
                      key={b.name}
                      className={`p-5 align-top leading-relaxed ${
                        b.ours ? `bg-cobalt font-semibold text-cream ${r === competitors.rows.length - 1 ? "rounded-b-[1.5rem]" : ""}` : "text-cobalt/80"
                      }`}
                    >
                      {b.cells[r]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <p className="mt-4 text-xs text-cobalt/55">Precios de la competencia aproximados, tomados de la investigación de mercado del equipo.</p>
      </div>
    </section>
  );
}

/* ---------------- business model: how to buy ---------------- */

export function HowToBuy() {
  const cards = [
    { title: "Precio", body: <><span className="font-display text-5xl">{formatPrice(pack.price)}</span><br />Paquete de {pack.shots} shots de {pack.mlPerShot} mL</> },
    { title: "Formas de pago", list: business.payments },
    { title: "Dónde comprar", list: business.channels },
    { title: "Ubicación", body: <>{brand.address}</> },
  ];
  return (
    <section id="comprar" className="bg-sand px-4 py-28 text-cobalt md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <Eyebrow>Cómo comprar</Eyebrow>
        <SplitReveal className="mb-14 font-display text-[14vw] uppercase leading-[0.85] md:text-[7vw]">
          Tu shot, a la mano.
        </SplitReveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div key={c.title} {...rise(i)} className="flex flex-col gap-5 rounded-[2rem] bg-cream p-7">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-cobalt/60">{c.title}</h3>
              {c.list ? (
                <ul className="space-y-2 font-display text-3xl uppercase leading-tight">
                  {c.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">{c.body}</p>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#producto">
            <Magnetic className="rounded-full bg-cobalt px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-cream">
              Comprar ahora →
            </Magnetic>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- about: origin, mission, vision, values ---------------- */

export function About() {
  return (
    <section id="nosotros" className="weave relative px-4 py-28 text-cream md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow light>Nuestra historia · {brand.project}</Eyebrow>
            <SplitReveal className="font-display text-[14vw] uppercase leading-[0.85] md:text-[6.5vw]">
              Pequeños shots, grandes objetivos.
            </SplitReveal>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p className="text-lg leading-relaxed text-cream/85">{about.origin}</p>
            {about.originPending && (
              <div>
                <Pending>Texto por confirmar</Pending>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {[
            ["Misión", about.mission],
            ["Visión", about.vision],
          ].map(([t, body], i) => (
            <motion.div key={t} {...rise(i)} className="rounded-[2rem] border border-cream/15 bg-cream/[0.05] p-8">
              <h3 className="mb-4 font-display text-4xl uppercase">{t}</h3>
              <p className="leading-relaxed text-cream/80">{body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <motion.div key={v.name} {...rise(i)} className="rounded-[2rem] bg-cream p-7 text-cobalt">
              <h4 className="font-display text-3xl uppercase">{v.name}</h4>
              <p className="mt-3 text-sm leading-relaxed text-cobalt/75">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- team ---------------- */

export function Team() {
  return (
    <section id="equipo" className="paper px-4 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>El equipo</Eyebrow>
            <SplitReveal className="font-display text-[14vw] uppercase leading-[0.85] md:text-[7vw]">
              Un gran equipo.
            </SplitReveal>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cobalt/75">
            Al principio somos cinco y todos ayudamos a preparar, promocionar y vender. Cada quien lidera un área.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {team.map((m, i) => (
            <motion.article key={m.name} {...rise(i)} className="group flex flex-col gap-5 rounded-[2rem] bg-sand/60 p-6">
              <div className="aspect-square overflow-hidden rounded-full bg-[#cfdcf0]">
                <img
                  src={m.photo}
                  alt={m.name}
                  className="h-full w-full scale-110 object-cover grayscale transition-all duration-700 ease-premium group-hover:scale-125 group-hover:grayscale-0"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl uppercase leading-none">{m.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-cobalt/60">{m.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-cobalt/75">{m.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */

export function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="weave relative overflow-hidden px-4 pt-28 text-cream md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <img src="brand/logo-cream.svg" alt="COW SHOTS — Fuel. Grow. Perform." className="w-full max-w-sm" />
        </div>
        <div className="flex flex-col gap-10">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-cream/60">Síguenos</h3>
            <ul className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.name}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="block rounded-full border border-cream/30 px-5 py-3 text-sm hover:bg-cream hover:text-cobalt">
                      {s.name} {s.handle}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 rounded-full border border-cream/30 px-5 py-3 text-sm">
                      {s.name} <Pending>Próximamente</Pending>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-cream/60">Recibe novedades</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex items-center gap-2 rounded-full border border-cream/30 p-2"
            >
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="tu@correo.com"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-cream/50"
              />
              <Magnetic type="submit" className="rounded-full bg-cream px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cobalt">
                {sent ? "¡Listo! ✓" : "Unirme"}
              </Magnetic>
            </form>
          </div>
          <details className="text-xs text-cream/70">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.25em] text-cream/60">Referencias</summary>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              {references.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </details>
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-[1400px] flex-col gap-3 border-t border-cream/15 py-6 text-xs text-cream/60 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} {brand.legalName}</span>
        <span className="max-w-xl md:text-right">{brand.address}</span>
      </div>

      <motion.div
        initial={{ y: "40%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease }}
        className="pointer-events-none -mb-[3vw] select-none text-center font-display text-[21vw] leading-[0.8] text-cream"
      >
        COW SHOTS
      </motion.div>
    </footer>
  );
}
