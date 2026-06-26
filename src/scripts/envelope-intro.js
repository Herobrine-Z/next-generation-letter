import gsap from "gsap";
import { assetUrl } from "./asset-loader.js";

export function setupEnvelopeIntro() {
  const root = document.querySelector("[data-envelope-intro]");
  if (!root) return () => {};

  const params = new URLSearchParams(window.location.search);
  const isCapture = document.documentElement.dataset.capture === "true";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skipForHash = window.location.hash && window.location.hash !== "#prologue";
  const shouldSkip = isCapture || params.get("intro") === "0" || skipForHash || window.scrollY > 24;
  const scene = root.querySelector(".envelope-intro__scene img");
  const stage = root.querySelector(".envelope-stage");
  const envelope = root.querySelector(".envelope");
  const flap = root.querySelector(".envelope__flap");
  const letter = root.querySelector(".envelope__letter");
  const letterContent = root.querySelector(".envelope__letter-content");
  const thread = root.querySelector(".envelope__thread");
  const kicker = root.querySelector(".envelope-intro__kicker");
  const whisper = root.querySelector(".envelope-intro__whisper");
  const skipButton = root.querySelector(".envelope-intro__skip");

  if (scene) scene.src = assetUrl("00_Cover/AI_Cover_DarkLetter.webp");

  if (shouldSkip) {
    root.remove();
    return () => {};
  }

  let completed = false;
  let timeline;
  document.documentElement.classList.add("intro-active");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  const finish = () => {
    if (completed) return;
    completed = true;
    document.removeEventListener("keydown", onKeydown);
    document.documentElement.classList.remove("intro-active");
    root.setAttribute("aria-hidden", "true");
    gsap.to(root, {
      autoAlpha: 0,
      duration: reduceMotion ? 0.18 : 0.68,
      ease: "power2.out",
      onComplete: () => {
        root.remove();
        window.dispatchEvent(new CustomEvent("envelope:intro-complete"));
      }
    });
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      timeline?.kill();
      finish();
    }
  };

  document.addEventListener("keydown", onKeydown);
  skipButton?.addEventListener("click", () => {
    timeline?.kill();
    finish();
  }, { once: true });

  if (reduceMotion) {
    gsap.set(root, { autoAlpha: 1 });
    gsap.set([stage, letterContent, kicker, whisper], { autoAlpha: 1, y: 0 });
    timeline = gsap.timeline().to(root, { duration: 0.65 }).call(finish);
    return () => timeline?.kill();
  }

  gsap.set(root, { autoAlpha: 1 });
  gsap.set(stage, { autoAlpha: 0, y: 44, scale: 0.94 });
  gsap.set(kicker, { autoAlpha: 0, y: 10 });
  gsap.set(whisper, { autoAlpha: 0, y: 12 });
  gsap.set(letterContent, { autoAlpha: 0, y: 18 });
  gsap.set(thread, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(flap, { rotationX: 0, transformOrigin: "50% 0%" });

  timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
  timeline
    .to(scene, { opacity: 0.58, scale: 1, duration: 1.15 }, 0)
    .to(stage, { autoAlpha: 1, y: 0, scale: 1, duration: 1.05 }, 0.12)
    .to(kicker, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.35)
    .to(flap, { rotationX: -176, duration: 1.18, ease: "power3.inOut" }, 1.2)
    .set(flap, { zIndex: 1 }, 1.9)
    .to(letter, { yPercent: -58, duration: 1.24, ease: "power3.out" }, 1.58)
    .to(letterContent, { autoAlpha: 1, y: 0, duration: 0.72 }, 2.05)
    .to(thread, { scaleY: 1, duration: 0.88, ease: "power2.inOut" }, 2.18)
    .to(whisper, { autoAlpha: 1, y: 0, duration: 0.62 }, 2.42)
    .to(envelope, { scale: 1.055, duration: 0.9, ease: "sine.inOut" }, 3.08)
    .to(".envelope__shell, .envelope__front, .envelope__flap", { autoAlpha: 0, duration: 0.62, ease: "power2.in" }, 3.42)
    .to(letter, { yPercent: -72, scale: 1.22, duration: 1.05, ease: "power2.inOut" }, 3.36)
    .to([kicker, whisper], { autoAlpha: 0, duration: 0.42 }, 3.7)
    .to(stage, { autoAlpha: 0, y: -24, duration: 0.78, ease: "power2.in" }, 4.08)
    .to(scene, { opacity: 0.28, scale: 1.02, duration: 0.8, ease: "none" }, 4.05)
    .call(finish, null, 4.72);

  return () => {
    timeline?.kill();
    document.removeEventListener("keydown", onKeydown);
    document.documentElement.classList.remove("intro-active");
    root.remove();
  };
}
