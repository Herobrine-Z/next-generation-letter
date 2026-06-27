import gsap from "gsap";
import { assetUrl } from "./asset-loader.js";

const STATE = Object.freeze({
  IDLE: "idle",
  OPENING: "opening",
  REVEALING: "revealing",
  TRANSITIONING: "transitioning",
  COMPLETE: "complete",
  SKIPPED: "skipped"
});

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

function clearInlineStyles(nodes) {
  nodes.forEach((node) => {
    if (node) node.removeAttribute("style");
  });
}

export function setupEnvelopeIntro({ audio } = {}) {
  const root = document.querySelector("[data-envelope-intro]");
  if (!root) {
    window.dispatchEvent(new CustomEvent("envelope:intro-complete", { detail: { mode: "skipped" } }));
    return () => {};
  }

  const params = new URLSearchParams(window.location.search);
  const isCapture = document.documentElement.dataset.capture === "true";
  const skipForHash = window.location.hash && window.location.hash !== "#prologue";
  const shouldSkip = isCapture || params.get("intro") === "0" || skipForHash || window.scrollY > 24;
  const introSpeed = Number(params.get("introSpeed")) || 1;
  const forcedReducedMotion = params.get("motion") === "reduce";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const el = {
    scene: root.querySelector(".envelope-intro__scene img"),
    shade: root.querySelector(".envelope-intro__shade"),
    stage: root.querySelector(".envelope-stage"),
    trigger: root.querySelector(".envelope-trigger"),
    hint: root.querySelector(".envelope-intro__hint"),
    envelope: root.querySelector(".envelope"),
    flapClosed: root.querySelector(".envelope__flap-closed"),
    flapOpen: root.querySelector(".envelope__flap-open"),
    mouthCover: root.querySelector(".envelope__mouth-cover"),
    seal: root.querySelector(".envelope__seal"),
    letter: root.querySelector(".envelope__letter"),
    letterContent: root.querySelector(".letter-content"),
    eyebrow: root.querySelector(".letter-content__eyebrow"),
    title: root.querySelector(".letter-content__title"),
    subtitle: root.querySelector(".letter-content__subtitle"),
    redline: root.querySelector(".letter-content__redline"),
    date: root.querySelector(".envelope-intro__kicker"),
    caption: root.querySelector(".envelope-intro__whisper"),
    skipButton: root.querySelector(".envelope-intro__skip")
  };

  if (el.scene) el.scene.src = assetUrl("00_Cover/AI_Cover_DarkLetter.webp");

  if (shouldSkip) {
    root.remove();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.dispatchEvent(new CustomEvent("envelope:intro-complete", { detail: { mode: "skipped" } }));
    return () => {};
  }

  let state = STATE.IDLE;
  let completed = false;
  let started = false;
  let pendingOpen = false;
  let timeline = null;
  let mm = null;

  const setState = (next) => {
    state = next;
    root.dataset.state = next;
    if (el.trigger) {
      el.trigger.disabled = next !== STATE.IDLE;
      el.trigger.setAttribute("aria-expanded", String(next !== STATE.IDLE));
    }
  };

  const hideEntireLetter = () => {
    el.letter.dataset.visible = "false";
    el.letterContent.hidden = true;
  };

  const showPaperOnly = () => {
    el.letter.dataset.visible = "true";
    gsap.set(el.letter, { autoAlpha: 1 });
  };

  const showText = () => {
    el.letterContent.hidden = false;
  };

  const removeListeners = () => {
    el.trigger?.removeEventListener("click", open);
    el.skipButton?.removeEventListener("click", skip);
    document.removeEventListener("keydown", onKeydown);
  };

  const completeIntro = (mode) => {
    if (completed) return;
    completed = true;
    timeline?.kill();
    timeline = null;
    removeListeners();
    document.documentElement.classList.remove("intro-active");
    document.body.style.overflow = "";
    setState(mode === "skipped" ? STATE.SKIPPED : STATE.COMPLETE);
    root.style.pointerEvents = "none";
    root.style.visibility = "hidden";
    root.remove();
    mm?.revert();
    mm = null;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.dispatchEvent(new CustomEvent("envelope:intro-complete", { detail: { mode } }));
  };

  const finalizeIntro = (mode) => {
    if (completed) return;
    if (mode === "played") {
      completeIntro(mode);
      return;
    }
    timeline?.kill();
    timeline = null;
    gsap.killTweensOf(root);
    root.style.pointerEvents = "none";
    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.18,
      ease: "power2.out",
      onComplete: () => completeIntro(mode)
    });
  };

  function prepare() {
    clearInlineStyles([
      el.hint,
      el.envelope,
      el.flapClosed,
      el.flapOpen,
      el.mouthCover,
      el.seal,
      el.letter,
      el.letterContent,
      el.eyebrow,
      el.title,
      el.subtitle,
      el.redline,
      el.date,
      el.caption,
      el.skipButton
    ]);
    setState(STATE.IDLE);
    hideEntireLetter();
    gsap.set(root, { autoAlpha: 1 });
    gsap.set(el.scene, { opacity: 0.18, scale: 1.055 });
    gsap.set(el.stage, { autoAlpha: 1, y: 0 });
    gsap.set(el.letter, { yPercent: 0, scale: 0.985, autoAlpha: 0 });
    gsap.set(el.flapClosed, { scaleY: 1, autoAlpha: 1, transformOrigin: "50% 0%" });
    gsap.set(el.flapOpen, { scaleY: 0.001, autoAlpha: 0, transformOrigin: "50% 100%" });
    gsap.set(el.mouthCover, { autoAlpha: 1 });
    gsap.set(el.seal, { scale: 1, autoAlpha: 1, xPercent: -50, yPercent: -50 });
    gsap.set(el.letterContent, { autoAlpha: 0, y: 14 });
    gsap.set([el.eyebrow, el.title, el.subtitle], { autoAlpha: 0, y: 12 });
    gsap.set(el.redline, { autoAlpha: 0, scaleY: 0, transformOrigin: "top center" });
  }

  function applyTestFrame(frame) {
    if (!frame || frame === "idle") return;
    if (frame === "opened") {
      setState(STATE.OPENING);
      gsap.set(el.flapClosed, { autoAlpha: 0, scaleY: 0.001 });
      gsap.set(el.flapOpen, { autoAlpha: 1, scaleY: 1 });
      gsap.set(el.mouthCover, { autoAlpha: 0 });
      gsap.set(el.seal, { autoAlpha: 0 });
      hideEntireLetter();
    }
    if (frame === "paper-half" || frame === "paper-out" || frame === "title") {
      setState(STATE.REVEALING);
      gsap.set(el.flapClosed, { autoAlpha: 0, scaleY: 0.001 });
      gsap.set(el.flapOpen, { autoAlpha: 1, scaleY: 1 });
      gsap.set(el.mouthCover, { autoAlpha: 0 });
      gsap.set(el.seal, { autoAlpha: 0 });
      showPaperOnly();
      gsap.set(el.letter, { yPercent: frame === "paper-half" ? -25 : -72, scale: 1 });
      if (frame === "paper-out" || frame === "title") {
        showText();
        gsap.set(el.letterContent, { autoAlpha: 1, y: 0 });
        gsap.set([el.eyebrow, el.title, el.subtitle], { autoAlpha: 1, y: 0 });
        gsap.set(el.redline, { autoAlpha: 1, scaleY: 1 });
      }
    }
  }

  function buildTimeline({ isMobile }) {
    prepare();
    const extract = isMobile ? -76 : -72;
    const stageLift = isMobile ? "-4vh" : "-3vh";
    const finalScale = isMobile ? 1.72 : 1.48;

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.inOut" },
      onComplete: () => finalizeIntro("played")
    });

    tl.timeScale(Math.min(Math.max(introSpeed, 0.1), 2));
    tl
      .to(el.scene, { opacity: 0.58, scale: 1, duration: 0.8 }, 0)
      .to(el.hint, { autoAlpha: 0, y: 10, duration: 0.25, ease: "power2.out" }, 0)
      .to(el.seal, { scale: 0.78, autoAlpha: 0, duration: 0.28, ease: "power2.in" }, 0)
      .to(el.flapClosed, { scaleY: 0.001, autoAlpha: 0, duration: 0.48, ease: "power2.in" }, 0.24)
      .to(el.flapOpen, { scaleY: 1, autoAlpha: 1, duration: 0.56, ease: "power3.out" }, 0.52)
      .to(el.mouthCover, { autoAlpha: 0, duration: 0.16, ease: "none" }, 0.94)
      .add(() => {
        showPaperOnly();
        audio?.playPaperSlide();
      }, 1.02)
      .to(el.letter, { yPercent: extract, scale: 1, duration: 1.02, ease: "power4.out" }, 1.02)
      .to(el.stage, { y: stageLift, duration: 1.02 }, 1.02)
      .add(() => {
        setState(STATE.REVEALING);
        showText();
        gsap.set(el.letterContent, { autoAlpha: 0, y: 14 });
        gsap.set([el.eyebrow, el.title, el.subtitle], { autoAlpha: 0, y: 12 });
        gsap.set(el.redline, { autoAlpha: 0, scaleY: 0, transformOrigin: "top center" });
      }, 2.02)
      .to(el.letterContent, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.05)
      .to(el.eyebrow, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 2.18)
      .to(el.title, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 2.35)
      .to(el.subtitle, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 2.52)
      .to(el.redline, { autoAlpha: 1, scaleY: 1, duration: 0.6, ease: "power2.out" }, 2.72)
      .add(() => setState(STATE.TRANSITIONING), 3.38)
      .to([el.date, el.caption, el.skipButton], { autoAlpha: 0, duration: 0.38 }, 3.7)
      .to(el.envelope, { scale: finalScale, y: isMobile ? "-3vh" : "-2vh", duration: 1.08 }, 3.7)
      .to(el.shade, { opacity: 0.76, duration: 1.08 }, 3.7)
      .to(root, { autoAlpha: 0, duration: 0.72 }, 4.78);

    return tl;
  }

  function initTimelines() {
    mm?.revert();
    mm = null;
    if (completed) return;
    timeline?.kill();
    timeline = buildTimeline({
      isDesktop: window.matchMedia("(min-width: 769px)").matches,
      isMobile: window.matchMedia("(max-width: 768px)").matches
    });
    applyTestFrame(params.get("frame"));
    if (pendingOpen && state === STATE.OPENING) {
      pendingOpen = false;
      timeline.restart();
    }
  }

  function open() {
    if (state !== STATE.IDLE || completed) return;
    audio?.playPaperOpen();
    audio?.startDarkAmbient();
    setState(STATE.OPENING);
    if (forcedReducedMotion || reducedMotion.matches) {
      showPaperOnly();
      showText();
      gsap.set(el.flapClosed, { autoAlpha: 0, scaleY: 0.001 });
      gsap.set(el.flapOpen, { autoAlpha: 1, scaleY: 1 });
      gsap.set(el.mouthCover, { autoAlpha: 0 });
      gsap.set(el.seal, { autoAlpha: 0 });
      gsap.set(el.letter, { yPercent: -40, scale: 1 });
      gsap.set([el.letterContent, el.eyebrow, el.title, el.subtitle, el.redline], { autoAlpha: 1, y: 0 });
      window.setTimeout(() => finalizeIntro("reduced-motion"), 260);
      return;
    }
    if (timeline) {
      timeline.restart();
    } else {
      pendingOpen = true;
    }
  }

  function skip() {
    if (completed) return;
    finalizeIntro("skipped");
  }

  function onKeydown(event) {
    if (event.key === "Escape") skip();
  }

  async function start() {
    if (started || completed) return;
    started = true;
    document.documentElement.classList.add("intro-active");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    prepare();
    await Promise.all([
      waitWithTimeout(document.fonts?.ready || Promise.resolve(), FONT_TIMEOUT),
      waitWithTimeout(preloadImage(el.scene), IMAGE_TIMEOUT)
    ]);
    if (completed) return;
    initTimelines();
    gsap.set(root, { autoAlpha: 1 });
    el.trigger?.addEventListener("click", open);
    el.skipButton?.addEventListener("click", skip);
    document.addEventListener("keydown", onKeydown);
    if (params.get("autoplay") === "1") window.setTimeout(open, 120);
  }

  start();

  return () => {
    timeline?.kill();
    mm?.revert();
    removeListeners();
    document.documentElement.classList.remove("intro-active");
    document.body.style.overflow = "";
    root.remove();
  };
}
