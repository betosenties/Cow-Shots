"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { flavors } from "@/lib/content";
import { palette } from "@/lib/palette";
import { frame, store } from "@/lib/store";

/* ---------- geometry profiles (y = height, x = radius) ---------- */
// Proportions measured from the product photo: body radius = 1 unit.

const BOTTLE_PROFILE: [number, number][] = [
  [0, 0.02], [0.55, 0], [0.86, 0.01], [0.96, 0.06], [1.0, 0.2], [1.0, 4.5], [0.985, 4.66],
  [0.93, 4.84], [0.83, 4.99], [0.71, 5.09], [0.63, 5.15], [0.6, 5.2], [0.6, 5.36],
];
const LIQUID_PROFILE: [number, number][] = [
  [0, 0.05], [0.84, 0.05], [0.94, 0.1], [0.97, 0.22], [0.97, 4.5], [0.955, 4.65], [0.9, 4.82],
  [0.8, 4.97], [0.69, 5.07], [0.61, 5.13], [0.57, 5.18], [0, 5.18],
];
const CAP = { bottom: 5.27, height: 0.74, radius: 0.76 };
export const HEIGHT = CAP.bottom + CAP.height;
const NECK_Y = 5.22;
const LABEL = { radius: 1.004, bottom: 0.55, height: 3.6 };
const GOLD = "#B49656";

const lathe = (pts: [number, number][], segments = 96) =>
  new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segments);

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------- paper label like the product photo: gold frame, logo front and back ---------- */

export function useLabelTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    // label circumference (2π·1.004) : height (3.6) ≈ 1.75 : 1
    canvas.width = 2048;
    canvas.height = 1170;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  useEffect(() => {
    const logo = new Image();
    logo.src = "brand/mark-deep.svg";
    let flavor = store.get().flavor;

    const draw = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const W = canvas.width;
      const H = canvas.height;
      const css = getComputedStyle(document.documentElement);
      const display = css.getPropertyValue("--font-anton").trim() || "Impact";
      const body = css.getPropertyValue("--font-inter").trim() || "sans-serif";

      // paper with a faint fibre texture
      ctx.fillStyle = "#F8F4EA";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = `rgba(120,100,60,${Math.random() * 0.035})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1);
      }

      const panel = (cx: number) => {
        const pw = 560;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4;
        ctx.strokeRect(cx - pw / 2, 60, pw, H - 120);
        if (logo.complete && logo.naturalWidth) {
          const lw = 460;
          ctx.drawImage(logo, cx - lw / 2, 200, lw, lw * (660 / 1180));
        }
        ctx.fillStyle = palette.cobaltDeep;
        ctx.textAlign = "center";
        ctx.font = `600 34px ${body}, sans-serif`;
        ctx.fillText("CALOSTRO BOVINO", cx, 600);
        ctx.fillText("LISTO PARA TOMAR", cx, 648);
        ctx.font = `110px ${display}, Impact, sans-serif`;
        ctx.fillText(flavors[flavor].name.toUpperCase(), cx, 830);
        ctx.font = `500 30px ${body}, sans-serif`;
        ctx.fillText("60 mL", cx, 960);
      };
      panel(W / 2);
      panel(0);
      panel(W);

      // side panels: slogan
      ctx.fillStyle = palette.cobaltDeep;
      ctx.textAlign = "center";
      ctx.font = `92px ${display}, Impact, sans-serif`;
      ["FUEL.", "GROW.", "PERFORM."].forEach((w, i) => {
        ctx.fillText(w, W * 0.25, 470 + i * 120);
        ctx.fillText(w, W * 0.75, 470 + i * 120);
      });
      texture.needsUpdate = true;
    };

    logo.onload = draw;
    draw();
    document.fonts?.ready.then(draw);
    const unsub = store.subscribe(() => {
      if (store.get().flavor !== flavor) {
        flavor = store.get().flavor;
        draw();
      }
    });
    return () => {
      unsub();
    };
  }, [texture]);

  return texture;
}

/* cap with real knurled grooves (geometry, not a texture) */
function useCapGeometry() {
  return useMemo(() => {
    const g = new THREE.CylinderGeometry(CAP.radius, CAP.radius, CAP.height - 0.06, 240, 1, true);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const r = CAP.radius + 0.014 * Math.cos(a * 80);
      pos.setX(i, Math.cos(a) * r);
      pos.setZ(i, Math.sin(a) * r);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/* rounded top of the cap */
const CAP_TOP: [number, number][] = [
  [CAP.radius + 0.01, 0], [CAP.radius, 0.03], [CAP.radius - 0.03, 0.06], [0, 0.07],
];

/* ---------- condensation: tiny water beads on the cold plastic ---------- */

function Condensation({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const y = 0.25 + Math.random() * 4.6;
      const onLabel = y > LABEL.bottom && y < LABEL.bottom + LABEL.height && Math.random() < 0.6;
      const r = y > 4.5 ? THREE.MathUtils.lerp(1, 0.75, (y - 4.5) / 0.35) : 1.0;
      d.position.set(Math.cos(a) * (r + 0.006), y, Math.sin(a) * (r + 0.006));
      d.lookAt(Math.cos(a) * 3, y, Math.sin(a) * 3);
      // fewer beads on the paper label than on the bare plastic
      const s = onLabel ? 0 : 0.008 + Math.pow(Math.random(), 3) * 0.03;
      d.scale.set(s, s * (1 + Math.random() * 0.6), s * 0.45);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhysicalMaterial color="#ffffff" roughness={0} clearcoat={1} transparent opacity={0.32} ior={1.33} />
    </instancedMesh>
  );
}

/* ---------- the bottle: PET shell + milk + label + cap ---------- */

/* reusable bottle model (base at y = 0); `lite` swaps the costly transmission shell for a cheap clear one */
export function BottleModel({
  label,
  liquidRef,
  lite = false,
}: {
  label: THREE.Texture;
  liquidRef?: React.Ref<THREE.MeshPhysicalMaterial>;
  lite?: boolean;
}) {
  const { size } = useThree();
  const capGeo = useCapGeometry();
  const shellGeo = useMemo(() => lathe(BOTTLE_PROFILE, 160), []);
  const liquidGeo = useMemo(() => lathe(LIQUID_PROFILE, 96), []);
  const capTopGeo = useMemo(() => lathe(CAP_TOP, 160), []);
  const lowRes = size.width < 768;

  return (
    <>
      {/* clear PET plastic */}
      <mesh geometry={shellGeo} renderOrder={2}>
        {lite ? (
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.05} clearcoat={1} clearcoatRoughness={0.03} depthWrite={false} />
        ) : (
          <MeshTransmissionMaterial
            background={new THREE.Color(palette.cobalt)}
            samples={lowRes ? 4 : 8}
            resolution={lowRes ? 256 : 1024}
            thickness={0.06}
            roughness={0.04}
            ior={1.57}
            chromaticAberration={0.02}
            anisotropicBlur={0.02}
            distortion={0.02}
            distortionScale={0.2}
            temporalDistortion={0}
            clearcoat={1}
            clearcoatRoughness={0.02}
            specularIntensity={1}
            color="#ffffff"
          />
        )}
      </mesh>

      {/* milk: soft, slightly waxy surface with a sheen */}
      <mesh geometry={liquidGeo}>
        <meshPhysicalMaterial
          ref={liquidRef}
          color={palette.vanilla}
          roughness={0.45}
          sheen={1}
          sheenColor="#fffaf0"
          sheenRoughness={0.6}
          clearcoat={0.15}
        />
      </mesh>

      {/* paper label */}
      <mesh position={[0, LABEL.bottom + LABEL.height / 2, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[LABEL.radius, LABEL.radius, LABEL.height, 160, 1, true]} />
        <meshPhysicalMaterial map={label} roughness={0.7} clearcoat={0.1} clearcoatRoughness={0.6} />
      </mesh>

      {!lite && <Condensation />}

      {/* neck support ring */}
      <mesh position={[0, NECK_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.64, 0.035, 16, 120]} />
        <meshPhysicalMaterial color="#eef2f9" roughness={0.15} transmission={lite ? 0 : 0.5} thickness={0.1} />
      </mesh>

      {/* navy cap: knurled side + rounded top */}
      <group position={[0, CAP.bottom, 0]}>
        <mesh geometry={capGeo} position={[0, (CAP.height - 0.06) / 2, 0]}>
          <meshPhysicalMaterial color={palette.cap} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={capTopGeo} position={[0, CAP.height - 0.07, 0]}>
          <meshPhysicalMaterial color={palette.cap} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} />
        </mesh>
      </group>
    </>
  );
}

function Bottle() {
  const group = useRef<THREE.Group>(null);
  const liquidMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const { viewport } = useThree();
  const label = useLabelTexture();

  const colors = useMemo(
    () => ({
      vanilla: new THREE.Color(palette.vanilla),
      chocolate: new THREE.Color(palette.chocolate),
      strawberry: new THREE.Color(palette.strawberry),
      target: new THREE.Color(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = frame.progress;
    const wide = viewport.width > 7;

    // scroll choreography: centre stage in the hero, then slides right for the story
    if (frame.studio) {
      // fixed three-quarter pose for product photos
      g.position.set(0, 0, 0);
      g.scale.setScalar(0.56);
      g.rotation.set(0.04, -0.3, 0);
      liquidMat.current?.color.set(flavors[store.get().flavor].milk);
      return;
    }
    const move = smooth(0.12, 0.3, p);
    const targetX = wide ? THREE.MathUtils.lerp(0, viewport.width * 0.22, move) : 0;
    const targetY = THREE.MathUtils.lerp(-0.1, wide ? 0 : 0.35, move) + Math.sin(t * 0.9) * 0.06;
    const targetS = THREE.MathUtils.lerp(wide ? 0.4 : 0.3, wide ? 0.46 : 0.28, move);
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 4, delta);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetS, 4, delta));

    const spin = t * 0.3 + p * Math.PI * 5;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, spin + frame.mouseX * 0.4, 6, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, Math.sin(t * 0.6) * 0.05 - frame.mouseX * 0.08, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.06 + frame.mouseY * 0.06, 3, delta);

    // milk colour follows the chosen flavour; with the default vanilla it turns chocolate and then
    // strawberry during the "tres sabores" chapter
    const flavor = store.get().flavor;
    colors.target.copy(colors[flavor]);
    if (flavor === "vanilla") {
      const toStrawberry = smooth(0.71, 0.76, p) * (1 - smooth(0.82, 0.88, p));
      const chocoMix = smooth(0.62, 0.68, p) * (1 - smooth(0.71, 0.76, p));
      colors.target.lerp(colors.chocolate, chocoMix).lerp(colors.strawberry, toStrawberry);
    }
    liquidMat.current?.color.lerp(colors.target, 1 - Math.exp(-delta * 4));
  });

  return (
    <group ref={group}>
      <group position={[0, -HEIGHT / 2, 0]}>
        <BottleModel label={label} liquidRef={liquidMat} />
        {!frame.studio && <Mist />}
      </group>
    </group>
  );
}

/* ---------- cold mist: soft sprites drifting up around the chilled bottle ---------- */

function Mist({ count = 40 }: { count?: number }) {
  const { gl } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.9 + Math.random() * 0.7;
      pos.set([Math.cos(a) * r, 0.1 + Math.random() * 0.4, Math.sin(a) * r], i * 3);
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: 900 * gl.getPixelRatio() }, uOpacity: { value: 0.14 } }),
    [gl],
  );

  useFrame((_, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += delta;
    // steam thins out as you scroll into the story
    mat.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.14, 0.07, Math.min(frame.progress * 3, 1));
  });

  return (
    <points geometry={geo} renderOrder={3}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          uniform float uTime;
          uniform float uSize;
          attribute float aSeed;
          varying float vAlpha;
          void main() {
            float life = fract(uTime * 0.11 + aSeed);
            vec3 p = position;
            p.y += life * 2.4;
            p.x += sin(life * 6.0 + aSeed * 20.0) * 0.35 * life;
            p.z += cos(life * 5.0 + aSeed * 13.0) * 0.3 * life;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (0.35 + life * 1.5) / -mv.z;
            vAlpha = smoothstep(0.0, 0.18, life) * (1.0 - smoothstep(0.45, 1.0, life));
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uOpacity;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = exp(-d * d * 18.0);
            gl_FragColor = vec4(0.99, 0.97, 0.93, a * vAlpha * uOpacity);
          }
        `}
      />
    </points>
  );
}

/* ---------- milk pool: rippling waves under the shot ---------- */

function MilkPool() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.RingGeometry(0.0001, 9, 160, 70), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const r = Math.sqrt(x * x + y * y);
      const h =
        Math.sin(r * 2.4 - t * 1.8) * 0.09 * Math.exp(-r * 0.18) +
        Math.sin(x * 0.7 + t * 0.6) * 0.12 +
        Math.cos(y * 0.9 - t * 0.45) * 0.08;
      pos.setZ(i, h);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    if (mesh.current) mesh.current.position.y = -2.25 - frame.progress * 0.6;
  });

  return (
    <mesh ref={mesh} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, -1]}>
      <meshPhysicalMaterial
        color={palette.cream}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.1}
        sheen={1}
        sheenColor="#ffffff"
      />
    </mesh>
  );
}

/* ---------- floating milk droplets ---------- */

function Droplets({ count = 22 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        radius: 2.2 + Math.random() * 2.6,
        angle: Math.random() * Math.PI * 2,
        y: -1.4 + Math.random() * 3.4,
        speed: 0.05 + Math.random() * 0.12,
        size: 0.015 + Math.random() * 0.045,
        phase: Math.random() * 10,
      })),
    [count],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mesh = ref.current;
    if (!mesh) return;
    data.forEach((d, i) => {
      const a = d.angle + t * d.speed + frame.progress * 2;
      dummy.position.set(Math.cos(a) * d.radius, d.y + Math.sin(t * 0.8 + d.phase) * 0.2, Math.sin(a) * d.radius - 0.5);
      const s = d.size * (1 + Math.sin(t * 2 + d.phase) * 0.08);
      dummy.scale.set(s, s * 1.12, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshPhysicalMaterial color={palette.cream} roughness={0.08} clearcoat={1} sheen={1} sheenColor="#fff" />
    </instancedMesh>
  );
}

/* ---------- dynamic lighting ---------- */

function Lights() {
  const warm = useRef<THREE.PointLight>(null);
  const cool = useRef<THREE.PointLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const sweep = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    warm.current?.position.set(Math.cos(t * 0.5) * 4, 2.5, Math.sin(t * 0.5) * 4);
    cool.current?.position.set(Math.cos(t * 0.5 + Math.PI) * 4, -0.5, Math.sin(t * 0.5 + Math.PI) * 4);
    if (spot.current) {
      spot.current.position.x = THREE.MathUtils.damp(spot.current.position.x, frame.mouseX * 6, 3, delta);
      spot.current.position.y = THREE.MathUtils.damp(spot.current.position.y, 5 + frame.mouseY * 3, 3, delta);
    }
    if (sweep.current) sweep.current.rotation.y = t * 0.25;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff8ee" />
      <pointLight ref={warm} intensity={14} distance={12} color="#ffe2b8" />
      <pointLight ref={cool} intensity={10} distance={12} color="#7fa2ff" />
      <spotLight ref={spot} position={[0, 5, 5]} angle={0.5} penumbra={1} intensity={30} color="#ffffff" />
      <Environment resolution={256} frames={Infinity}>
        <group ref={sweep}>
          <Lightformer form="rect" intensity={4} position={[0, 2, -6]} scale={[2, 8, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[1.2, 6, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#9bb6ff" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
        </group>
        <Lightformer form="circle" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={4} />
        {/* studio softboxes in front: the long vertical highlights seen on the real bottle */}
        <Lightformer form="rect" intensity={3.5} position={[-3, 0.5, 4]} rotation-y={-0.6} scale={[0.8, 7, 1]} />
        <Lightformer form="rect" intensity={2} position={[3.2, 0.5, 3.5]} rotation-y={0.7} scale={[0.5, 7, 1]} />
        {/* studio softboxes in front: the long vertical highlights seen on the real bottle */}
        <Lightformer form="rect" intensity={3.5} position={[-3, 0.5, 4]} rotation-y={-0.6} scale={[0.8, 7, 1]} />
        <Lightformer form="rect" intensity={2} position={[3.2, 0.5, 3.5]} rotation-y={0.7} scale={[0.5, 7, 1]} />
        <Lightformer form="ring" intensity={1.5} color={palette.sand} position={[0, -3, 4]} scale={3} />
      </Environment>
    </>
  );
}

/* ---------- canvas ---------- */

export default function ShotScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 7], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <fog attach="fog" args={[palette.cobalt, 7, 17]} />
      <Lights />
      <Bottle />
      {!frame.studio && (
        <>
          <MilkPool />
          <Droplets />
          <Sparkles count={70} scale={[10, 6, 4]} size={2.4} speed={0.35} opacity={0.7} color={palette.cream} />
        </>
      )}
    </Canvas>
  );
}
