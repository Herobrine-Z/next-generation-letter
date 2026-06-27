import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

if (import.meta.env.DEV) {
  window.__nglScrollTriggerCount = () => ScrollTrigger.getAll().length;
}

export { gsap, ScrollTrigger, MotionPathPlugin };
