# Cow Shots — landing page

Next.js 16 · Tailwind CSS 4 · React Three Fiber · GSAP ScrollTrigger + SplitText · Framer Motion

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Brand colors

The colors are estimates taken from the reference image. Change them in **two** places:

- `app/globals.css` → the `@theme` block (Tailwind classes such as `bg-cobalt`, `text-cream`)
- `lib/palette.ts` → colors used inside the 3D scene

## Content still pending (marked "PENDING" on the page)

- Prices and sizes for Vanilla and Chocolate
- Full ingredient list (only colostrum, vanilla and chocolate are shown)
- Nutrition facts (serving size, calories, protein, IgG, sugars, fat)
- Newsletter and checkout are visual only (not connected to a provider)

## Structure

- `components/three/ShotScene.tsx` — 3D shot: transmission glass, milk with surface waves, wrapped label, steam shader, milk pool, droplets, dynamic lights
- `components/HeroStory.tsx` — sticky 3D stage + scroll-driven story (4 chapters)
- `components/Sections.tsx` — marquee, products, flavor switcher, ingredients, horizontal ritual, footer
- `components/Chrome.tsx` — preloader, nav, cart drawer
- `components/ui.tsx` — magnetic button, SplitText reveal, cursor, shot illustration
