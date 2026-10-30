"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { store, useStore, type Flavor } from "@/lib/store";
import { business, flavors, formatPrice, pack } from "@/lib/content";
import { Magnetic } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1600, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setDone(true);
          document.documentElement.style.overflow = "";
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="weave fixed inset-0 z-[80] flex flex-col justify-between p-6 text-cream md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1, ease }}
        >
          <img src="brand/mark-cream.svg" alt="COW SHOTS" className="h-14 w-auto self-start md:h-20" />
          <div className="flex items-end justify-between">
            <span className="font-display text-[28vw] leading-[0.8] md:text-[18vw]">{count}</span>
            <span className="mb-4 text-xs uppercase tracking-[0.3em]">Fuel. Grow. Perform.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const links = [
  ["Producto", "#producto"],
  ["Empaque", "#empaque"],
  ["Beneficios", "#beneficios"],
  ["¿Por qué nosotros?", "#comparativa"],
  ["Nosotros", "#nosotros"],
];

export function Nav() {
  const cart = useStore((s) => s.cart);
  const qty = cart.vanilla + cart.chocolate;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.9, duration: 0.9, ease }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8"
    >
      <nav
        className={`mx-auto flex max-w-[1400px] items-center justify-between rounded-full px-5 py-2 transition-all duration-500 ${
          scrolled ? "bg-cream/85 text-cobalt shadow-[0_10px_40px_-15px_rgba(5,44,104,0.4)] backdrop-blur-md" : "text-cream"
        }`}
      >
        <a href="#top" aria-label="COW SHOTS, inicio">
          <img src={scrolled ? "brand/mark-blue.svg" : "brand/mark-cream.svg"} alt="COW SHOTS" className="h-10 w-auto" />
        </a>
        <ul className="hidden gap-7 text-xs font-semibold uppercase tracking-[0.18em] lg:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="group relative">
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-premium group-hover:origin-left group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
        <Magnetic
          onClick={() => store.set({ cartOpen: true })}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            scrolled ? "bg-cobalt text-cream" : "bg-cream text-cobalt"
          }`}
        >
          Carrito
          <motion.span
            key={qty}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            className="grid h-5 min-w-5 place-items-center rounded-full bg-current/20 px-1"
          >
            {qty}
          </motion.span>
        </Magnetic>
        {/* phones and tablets: the section links live behind a menu button */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className={`grid h-9 w-9 place-items-center rounded-full lg:hidden ${scrolled ? "bg-cobalt text-cream" : "bg-cream text-cobalt"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease }}
            className="mx-auto mt-2 flex max-w-[1400px] flex-col rounded-[1.75rem] bg-cream/95 p-3 text-cobalt shadow-[0_20px_50px_-20px_rgba(5,44,104,0.5)] backdrop-blur-md lg:hidden"
          >
            {links.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-display text-2xl uppercase hover:bg-cobalt/10"
                >
                  {label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function CartDrawer() {
  const { cart, cartOpen } = useStore((s) => s);
  const [notice, setNotice] = useState(false);
  const items = (Object.keys(cart) as Flavor[]).filter((f) => cart[f] > 0);
  const total = (cart.vanilla + cart.chocolate) * pack.price;

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-cobalt-deep/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => store.set({ cartOpen: false })}
          />
          <motion.aside
            className="paper fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col p-6 text-cobalt md:p-8"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-5xl">TU CARRITO</h3>
              <button
                type="button"
                onClick={() => store.set({ cartOpen: false })}
                className="text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-8 flex-1 space-y-4 overflow-y-auto">
              {items.length === 0 && <p className="text-sm opacity-70">Tu carrito está vacío. Elige tu sabor.</p>}
              <AnimatePresence>
                {items.map((f) => (
                  <motion.div
                    layout
                    key={f}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex items-center gap-4 rounded-3xl border border-cobalt/15 p-4"
                  >
                    <img src={f === "chocolate" ? "brand/bottle-chocolate.jpg" : "brand/bottle-vainilla.jpg"} alt="" className="h-20 w-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="font-display text-2xl">{flavors[f].name.toUpperCase()}</p>
                      <p className="text-xs opacity-70">
                        {pack.shots} shots de {pack.mlPerShot} mL · {formatPrice(pack.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-full border border-cobalt/20 px-3 py-1">
                      <button type="button" aria-label="Quitar uno" onClick={() => store.setQty(f, cart[f] - 1)}>−</button>
                      <span className="w-4 text-center text-sm tabular-nums">{cart[f]}</span>
                      <button type="button" aria-label="Agregar uno" onClick={() => store.setQty(f, cart[f] + 1)}>+</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t border-cobalt/15 pt-6">
              <div className="mb-2 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              <p className="mb-4 text-xs opacity-70">Pago con {business.payments.join(", ").toLowerCase()}.</p>
              {notice && (
                <p className="mb-4 rounded-2xl bg-cobalt/10 p-3 text-xs">
                  La tienda en línea está en construcción. Por ahora este carrito es una demostración.
                </p>
              )}
              <Magnetic
                strength={0.15}
                onClick={() => setNotice(true)}
                className="w-full rounded-full bg-cobalt py-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream"
              >
                Pagar
              </Magnetic>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
