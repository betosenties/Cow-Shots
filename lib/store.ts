import { useSyncExternalStore } from "react";

export type Flavor = "vanilla" | "chocolate";

type State = { flavor: Flavor; cart: Record<Flavor, number>; cartOpen: boolean };

let state: State = { flavor: "vanilla", cart: { vanilla: 0, chocolate: 0 }, cartOpen: false };
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addToCart(f: Flavor, qty = 1) {
    store.set({ cart: { ...state.cart, [f]: state.cart[f] + qty }, cartOpen: true });
  },
  setQty(f: Flavor, qty: number) {
    store.set({ cart: { ...state.cart, [f]: Math.max(0, qty) } });
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}

// Mutable values read every frame by the 3D scene (no React re-render).
export const frame = {
  progress: 0, // scroll progress through hero + story (0..1)
  chapter: 0,
  mouseX: 0,
  mouseY: 0,
  studio: false, // product-photo mode: fixed pose, no atmosphere
};

// Scroll progress through the packaging section (0..1), written by PackStory.
export const packFrame = { progress: 0 };
