"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // keep timelines on schedule even while the WebGL scene is warming up
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger, SplitText };
