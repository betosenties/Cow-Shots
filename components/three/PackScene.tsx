"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import { packFrame as pack, store } from "@/lib/store";
import { flavors } from "@/lib/content";
import { BottleModel, HEIGHT as BOTTLE_H, useLabelTexture } from "./ShotScene";


/* ---------- box dimensions (bottle radius = 1 unit) ---------- */

const GAP = 2.3; // distance between bottle centres
const BOX = { w: 7.1, d: 2.4, h: BOTTLE_H + 0.25, t: 0.05 };
const FLOOR = -BOX.h / 2;
const SPOTS = [-GAP, 0, GAP];
const KRAFT = "#C9A97A";

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

/* ---------- printed cardboard textures ---------- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function fontVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// window positions on the front panel, in 0..1 UV space
const WINDOW = { w: 1.7 / BOX.w, top: 0.1, bottom: 0.8 };
const windowRects = (W: number, H: number) =>
  SPOTS.map((x) => {
    const cx = ((x + BOX.w / 2) / BOX.w) * W;
    const ww = WINDOW.w * W;
    return { x: cx - ww / 2, y: WINDOW.top * H, w: ww, h: (WINDOW.bottom - WINDOW.top) * H, r: ww * 0.22 };
  });

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function useBoxTextures() {
  const tex = useMemo(() => {
    const make = (w: number, h: number) => {
      const t = new THREE.CanvasTexture(makeCanvas(w, h));
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    const alpha = new THREE.CanvasTexture(makeCanvas(1024, Math.round((1024 * BOX.h) / BOX.w)));
    return {
      front: make(2048, Math.round((2048 * BOX.h) / BOX.w)),
      frontAlpha: alpha,
      side: make(512, Math.round((512 * BOX.h) / BOX.d)),
      lid: make(2048, Math.round((2048 * BOX.d) / BOX.w)),
    };
  }, []);

  useEffect(() => {
    const logo = new Image();
    logo.src = "brand/mark-cream.svg";

    const draw = () => {
      const display = fontVar("--font-anton", "Impact");
      const body = fontVar("--font-inter", "sans-serif");
      const cream = palette.cream;

      // front: cobalt print, kraft-edged windows, logo + pack size along the bottom
      {
        const c = tex.front.image as HTMLCanvasElement;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = palette.cobalt;
        ctx.fillRect(0, 0, c.width, c.height);
        windowRects(c.width, c.height).forEach((r) => {
          ctx.strokeStyle = KRAFT;
          ctx.lineWidth = 22;
          roundRect(ctx, r.x, r.y, r.w, r.h, r.r);
          ctx.stroke();
        });
        if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, 70, c.height * 0.83, 300, 300 * (660 / 1180));
        ctx.fillStyle = cream;
        ctx.textAlign = "right";
        ctx.font = `92px ${display}, Impact, sans-serif`;
        ctx.fillText("PAQUETE DE 3 SHOTS", c.width - 70, c.height * 0.9);
        ctx.font = `600 34px ${body}, sans-serif`;
        ctx.fillText("CALOSTRO BOVINO  ·  60 mL C/U", c.width - 70, c.height * 0.95);
        tex.front.needsUpdate = true;
      }
      // alpha map: white = cardboard, black = window hole
      {
        const c = tex.frontAlpha.image as HTMLCanvasElement;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#000";
        windowRects(c.width, c.height).forEach((r) => {
          roundRect(ctx, r.x, r.y, r.w, r.h, r.r);
          ctx.fill();
        });
        tex.frontAlpha.needsUpdate = true;
      }
      // sides: stacked slogan, like the reference box
      {
        const c = tex.side.image as HTMLCanvasElement;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = palette.cobalt;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = cream;
        ctx.textAlign = "center";
        ctx.font = `110px ${display}, Impact, sans-serif`;
        ["FUEL.", "GROW.", "PERFORM."].forEach((w, i) => ctx.fillText(w, c.width / 2, 260 + i * 140));
        ctx.fillRect(c.width * 0.3, 720, c.width * 0.4, 4);
        ctx.font = `600 30px ${body}, sans-serif`;
        ["CALOSTRO BOVINO", "LISTO PARA TOMAR"].forEach((w, i) => ctx.fillText(w, c.width / 2, 820 + i * 50));
        tex.side.needsUpdate = true;
      }
      // lid: centred logo
      {
        const c = tex.lid.image as HTMLCanvasElement;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = palette.cobalt;
        ctx.fillRect(0, 0, c.width, c.height);
        if (logo.complete && logo.naturalWidth) {
          const lw = 640;
          ctx.drawImage(logo, c.width / 2 - lw / 2, c.height / 2 - (lw * 660) / 1180 / 2, lw, (lw * 660) / 1180);
        }
        tex.lid.needsUpdate = true;
      }
    };

    logo.onload = draw;
    draw();
    document.fonts?.ready.then(draw);
  }, [tex]);

  return tex;
}

/* ---------- the box: walls, front with windows, dust flaps, hinged lid ---------- */

function Box({ refs }: { refs: { root: React.RefObject<THREE.Group | null>; lid: React.RefObject<THREE.Group | null>; flapL: React.RefObject<THREE.Group | null>; flapR: React.RefObject<THREE.Group | null> } }) {
  const tex = useBoxTextures();
  const kraft = useMemo(() => new THREE.MeshStandardMaterial({ color: KRAFT, roughness: 0.9 }), []);
  const plain = useMemo(() => new THREE.MeshStandardMaterial({ color: palette.cobalt, roughness: 0.75 }), []);
  const sideMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex.side, roughness: 0.75 }), [tex]);
  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex.lid, roughness: 0.7 }), [tex]);
  const frontPrint = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.front, alphaMap: tex.frontAlpha, alphaTest: 0.5, roughness: 0.72 }),
    [tex],
  );
  const frontInner = useMemo(
    () => new THREE.MeshStandardMaterial({ color: KRAFT, alphaMap: tex.frontAlpha, alphaTest: 0.5, roughness: 0.9 }),
    [tex],
  );

  const { w, d, h, t } = BOX;
  // BoxGeometry material order: +x, -x, +y, -y, +z, -z
  const frontMats = [kraft, kraft, kraft, kraft, frontPrint, frontInner];
  const backMats = [kraft, kraft, kraft, kraft, kraft, plain];
  const leftMats = [kraft, sideMat, kraft, kraft, kraft, kraft];
  const rightMats = [sideMat, kraft, kraft, kraft, kraft, kraft];
  const lidMats = [kraft, kraft, lidMat, kraft, kraft, kraft];
  const flapLen = d * 0.45;

  return (
    <group ref={refs.root}>
      {/* floor */}
      <mesh position={[0, FLOOR, 0]} material={kraft}>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      <mesh position={[0, 0, d / 2]} material={frontMats}>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[0, 0, -d / 2]} material={backMats}>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]} material={leftMats}>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      <mesh position={[w / 2, 0, 0]} material={rightMats}>
        <boxGeometry args={[t, h, d]} />
      </mesh>

      {/* dust flaps, hinged on the side walls */}
      <group ref={refs.flapL} position={[-w / 2, h / 2, 0]}>
        <mesh position={[flapLen / 2, 0, 0]} material={kraft}>
          <boxGeometry args={[flapLen, t, d * 0.96]} />
        </mesh>
      </group>
      <group ref={refs.flapR} position={[w / 2, h / 2, 0]}>
        <mesh position={[-flapLen / 2, 0, 0]} material={kraft}>
          <boxGeometry args={[flapLen, t, d * 0.96]} />
        </mesh>
      </group>

      {/* lid, hinged on the back wall, printed with the logo */}
      <group ref={refs.lid} position={[0, h / 2 + t, -d / 2]}>
        <mesh position={[0, 0, d / 2]} material={lidMats}>
          <boxGeometry args={[w, t, d]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- choreography ---------- */

function PackRig() {
  const { viewport } = useThree();
  const label = useLabelTexture();
  const root = useRef<THREE.Group>(null);
  const bottles = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const liquids = [
    useRef<THREE.MeshPhysicalMaterial>(null),
    useRef<THREE.MeshPhysicalMaterial>(null),
    useRef<THREE.MeshPhysicalMaterial>(null),
  ];
  const boxRefs = {
    root: useRef<THREE.Group>(null),
    lid: useRef<THREE.Group>(null),
    flapL: useRef<THREE.Group>(null),
    flapR: useRef<THREE.Group>(null),
  };
  const milk = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const p = pack.progress;
    const t = state.clock.elapsedTime;
    const r = root.current;
    if (!r) return;

    // phases
    const split = smooth(0.1, 0.28, p); // one bottle becomes three
    const boxIn = smooth(0.28, 0.42, p); // box rises into view below
    const lift = smooth(0.3, 0.42, p) * (1 - smooth(0.46, 0.62, p)); // bottles hover above the box, then drop in
    const flaps = smooth(0.64, 0.72, p);
    const lidClose = smooth(0.72, 0.86, p);
    const reveal = smooth(0.86, 1, p);

    // framing: zoom out while the bottles hover above the box, back in once packed
    const fit = Math.min(1, viewport.width / 4);
    const packed = smooth(0.5, 0.66, p);
    const zoom = lerp(lerp(0.42, 0.28, smooth(0.28, 0.4, p)), 0.33, packed);
    const s = zoom * fit;
    r.scale.setScalar(THREE.MathUtils.damp(r.scale.x, s, 10, delta));
    const stackCenter = (BOX.h + 0.4) / 2;
    // once packed, lift the box clear of the caption and (on wide screens) move it right
    const wide = viewport.width > 7;
    r.position.y = THREE.MathUtils.damp(r.position.y, -stackCenter * lift * s + 0.3 * packed, 10, delta);
    r.position.x = THREE.MathUtils.damp(r.position.x, wide ? viewport.width * 0.14 * smooth(0.6, 0.75, p) : 0, 6, delta);

    // turn to show the box in three-quarter at the end
    r.rotation.x = lerp(0.12, 0.32, reveal);
    r.rotation.y = lerp(0, -0.55, reveal);

    // bottles
    const bottomPacked = FLOOR + BOX.t / 2;
    const bottomHover = BOX.h / 2 + 0.4;
    const y = lerp(lerp(-BOTTLE_H / 2, bottomHover, smooth(0.3, 0.42, p)), bottomPacked, smooth(0.46, 0.62, p));
    const spin = (1 - smooth(0.3, 0.46, p)) * (t * 0.5);
    milk.set(flavors[store.get().flavor].liquid);
    bottles.forEach((b, i) => {
      const g = b.current;
      if (!g) return;
      g.visible = i === 1 || split > 0.01;
      g.position.x = SPOTS[i] * split;
      g.position.z = (i === 1 ? 0 : -0.6) * (1 - split);
      g.position.y = y;
      g.rotation.y = spin + (i - 1) * 0.4 * (1 - smooth(0.3, 0.46, p));
      liquids[i].current?.color.lerp(milk, 1 - Math.exp(-delta * 4));
    });

    // box
    const box = boxRefs.root.current;
    if (box) {
      box.visible = boxIn > 0.001;
      box.position.y = lerp(-14, 0, boxIn);
    }
    if (boxRefs.flapL.current) boxRefs.flapL.current.rotation.z = lerp(0.8 * Math.PI, 0, flaps);
    if (boxRefs.flapR.current) boxRefs.flapR.current.rotation.z = lerp(-0.8 * Math.PI, 0, flaps);
    if (boxRefs.lid.current) boxRefs.lid.current.rotation.x = lerp(-0.72 * Math.PI, 0, lidClose);
  });

  return (
    <group ref={root} scale={0.4}>
      {bottles.map((b, i) => (
        <group key={i} ref={b}>
          <BottleModel label={label} liquidRef={liquids[i]} lite />
        </group>
      ))}
      <Box refs={boxRefs} />
    </group>
  );
}

export default function PackScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.8, 7], fov: 35 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.8} color="#fff8ee" />
      <directionalLight position={[-5, 2, 3]} intensity={0.6} color="#9bb6ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[-3, 1, 4]} rotation-y={-0.6} scale={[1, 7, 1]} />
        <Lightformer form="rect" intensity={2} position={[3.2, 1, 3.5]} rotation-y={0.7} scale={[0.6, 7, 1]} />
        <Lightformer form="circle" intensity={2.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={5} />
      </Environment>
      <PackRig />
    </Canvas>
  );
}
