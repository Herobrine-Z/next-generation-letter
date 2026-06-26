import gsap from "gsap";
import { assetUrl } from "./asset-loader.js";

const FONT_TIMEOUT = 1600;
const IMAGE_TIMEOUT = 1800;

function waitWithTimeout(promise, timeout) {
  return Promise.race([
    promise.catch(() => undefined),
    new Promise((resolve) => window.setTimeout(resolve, timeout))
  ]);
}

function preloadImage(img) {
  if (!img?.src || img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function unlockPage(root) {
  document.documentElement.classList.remove("intro-active");
  document.body.style.overflow = "";
  root.style.pointerEvents = "none";
}

export function setupEnvelopeIntro() {
  const root = document.querySelector("[data-envelope-intro]");
  if (!root) return () => {};

  const params = new URLSearchParams(window.location.search);
  const introSpeed = Number(params.get("introSpeed")) || 1;
  const isCapture = document.documentElement.dataset.capture === "true";
  const skipForHash = window.location.hash && window.location.hash !== "#prologue";
  const shouldSkip = isCapture || params.get("intro") === "0" || skipForHash || window.scrollY > 24;
  const scene = root.querySelector(".envelope-intro__scene img");
  const stage = root.querySelector(".envelope-stage");
  const envelope = root.querySelector(".envelope");
  const back = root.querySelector(".envelope__back");
  const flap = root.querySelector(".envelope__flap");
  const front = root.querySelector(".envelope__front");
  const sides = root.querySelectorAll(".envelope__side");
  const letter = root.querySelector(".envelope__letter");
  const letterContent = root.querySelector(".envelope__letter-content");
  const thread = root.querySelector(".envelope__thread");
  const kicker = root.querySelector(".envelope-intro__kicker");
  const whisper = root.querySelector(".envelope-intro__whisper");
  const skipButton = root.querySelector(".envelope-intro__skip");

  if (scene) scene.src = assetUrl("00_Cover/AI_Cover_DarkLetter.webp");

  if (shouldSkip) {
    root.remove();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return () => {};
  }

  let completed = false;
  let started = false;
  let timeline;
  const mm = gsap.matchMedia();

  root.dataset.state = "idle";
  document.documentElement.classList.add("intro-active");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  const removeListeners = () => {
    document.removeEventListener("keydown", onKeydown);
    skipButton?.removeEventListener("click", onSkip);
  };

  const finish = (state = "complete") => {
    if (completed) return;
    completed = true;
    root.dataset.state = state;
    removeListeners();
    unlockPage(root);
    gsap.killTweensOf(root);
    gsap.to(root, {
      autoAlpha: 0,
      duration: state === "skipped" ? 0.24 : 0.58,
      ease: "power2.out",
      onComplete: () => {
        root.remove();
        window.dispatchEvent(new CustomEvent("envelope:intro-complete"));
      }
    });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  function onSkip() {
    timeline?.kill();
    mm.revert();
    finish("skipped");
  }

  function onKeydown(event) {
    if (event.key === "Escape") onSkip();
  }

  function resetVisuals() {
    gsap.set(root, { autoAlpha: 1 });
    gsap.set(scene, { opacity: 0.18, scale: 1.055 });
    gsap.set(stage, { autoAlpha: 0, y: 36, scale: 0.94 });
    gsap.set(envelope, { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set(kicker, { autoAlpha: 0, y: 10 });
    gsap.set(whisper, { autoAlpha: 0, y: 10 });
    gsap.set(letterContent, { autoAlpha: 0, y: 14 });
    gsap.set(thread, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(back, { zIndex: 10, autoAlpha: 1 });
    gsap.set(letter, { zIndex: 20, yPercent: 0, scale: 1, autoAlpha: 1 });
    gsap.set(sides, { zIndex: 30, autoAlpha: 1 });
    gsap.set(front, { zIndex: 40, autoAlpha: 1 });
    gsap.set(flap, { zIndex: 50, rotationX: 0, autoAlpha: 1, transformOrigin: "50% 0%" });
  }

  function buildTimeline({ isMobile, reduceMotion }) {
    if (completed) return null;
    resetVisuals();

    const revealY = isMobile ? -38 : -43;
    const pushScale = isMobile ? 1.06 : 1.1;
    const stageExitY = isMobile ? -16 : -24;

    if (reduceMotion) {
      root.dataset.state = "letter-reveal";
      gsap.set([root, stage, kicker, letterContent, whisper], { autoAlpha: 1, y: 0 });
      gsap.set(flap, { rotationX: -176, zIndex: 15 });
      gsap.set(letter, { yPercent: -34 });
      return gsap.timeline().to(root, { duration: 0.9 }).call(() => finish());
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onStart: () => {
        root.dataset.state = "opening";
      }
    });

    tl.timeScale(Math.min(Math.max(introSpeed, 0.1), 2));
    tl
      .to(scene, { opacity: 0.58, scale: 1, duration: 1.05 }, 0)
      .to(stage, { autoAlpha: 1, y: 0, scale: 1, duration: 0.95 }, 0.1)
      .to(kicker, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.3)
      .to(flap, { rotationX: -176, duration: 1, ease: "power3.inOut" }, 1.05)
      .set(flap, { zIndex: 15 }, 1.98)
      .add(() => {
        root.dataset.state = "letter-reveal";
      }, 1.98)
      .to(letter, { yPercent: revealY, duration: 1.08, ease: "power3.out" }, 1.92)
      .to(letterContent, { autoAlpha: 1, y: 0, duration: 0.7 }, 2.75)
      .to(thread, { scaleY: 1, duration: 0.7, ease: "power2.inOut" }, 2.82)
      .to(whisper, { autoAlpha: 1, y: 0, duration: 0.5 }, 3)
      .add(() => {
        root.dataset.state = "transitioning";
      }, 3.45)
      .to([front, sides, flap], { autoAlpha: 0, duration: 0.36, ease: "power2.in" }, 3.5)
      .to(envelope, { scale: pushScale, y: stageExitY, duration: 0.82, ease: "power2.inOut" }, 3.45)
      .to([kicker, whisper], { autoAlpha: 0, duration: 0.36 }, 4.05)
      .to(stage, { autoAlpha: 0, y: stageExitY, duration: 0.68, ease: "power2.in" }, 4.18)
      .to(scene, { opacity: 0.28, scale: 1.02, duration: 0.68, ease: "none" }, 4.18)
      .call(() => finish(), null, 4.82);

    return tl;
  }

  async function start() {
    if (started || completed) return;
    started = true;
    await Promise.all([
      waitWithTimeout(document.fonts?.ready || Promise.resolve(), FONT_TIMEOUT),
      waitWithTimeout(preloadImage(scene), IMAGE_TIMEOUT)
    ]);
    if (completed) return;

    mm.add(
      {
        isDesktop: "(min-width: 769px)",
        isMobile: "(max-width: 768px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        timeline?.kill();
        timeline = buildTimeline(context.conditions);
        return () => timeline?.kill();
      }
    );
  }

  document.addEventListener("keydown", onKeydown);
  skipButton?.addEventListener("click", onSkip);
  start();

  return () => {
    timeline?.kill();
    mm.revert();
    removeListeners();
    unlockPage(root);
    root.remove();
  };
}
