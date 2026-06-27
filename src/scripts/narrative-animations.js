import { gsap, MotionPathPlugin, ScrollTrigger } from "./gsap-setup.js";

const q = (root, selector) => root.querySelector(selector);
const qa = (root, selector) => gsap.utils.toArray(selector, root);

function prepareDraw(element) {
  if (!element || typeof element.getTotalLength !== "function") return 0;
  const length = element.getTotalLength();
  gsap.set(element, { strokeDasharray: length, strokeDashoffset: length });
  return length;
}

function saveLineStart(line) {
  ["x1", "y1", "x2", "y2"].forEach((attr) => {
    line.dataset[`start${attr.toUpperCase()}`] = line.getAttribute(attr);
  });
}

function createOnceTrigger(root, timeline, start = "top 75%") {
  return ScrollTrigger.create({
    trigger: root,
    start,
    once: true,
    onEnter: () => timeline.play(0)
  });
}

function initArchiveDevelop(root, reduceMotion) {
  const stage = q(root, '[data-narrative-stage="archiveDevelop"]');
  if (!stage) return null;
  const photo = q(stage, ".ngl-archive-develop__frame");
  const scene = q(stage, ".ngl-archive-develop__image");
  const emulsion = q(stage, ".ngl-archive-develop__emulsion");
  const scan = q(stage, ".ngl-archive-develop__scan");
  const grain = q(stage, ".ngl-archive-develop__grain");
  const captionItems = qa(stage, ".ngl-archive-develop__caption > *");
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  tl.set(photo, { autoAlpha: 0.62, scale: 0.97, rotate: -1.4 })
    .set(scene, { filter: "grayscale(1) contrast(0.18) brightness(1.74) blur(7px)", opacity: 0.2, scale: 1.02 })
    .set(emulsion, { opacity: 0.94 })
    .set(scan, { opacity: 0, xPercent: 0 })
    .set(grain, { backgroundPosition: "0px 0px" })
    .set(captionItems, { autoAlpha: 0, y: 8 })
    .to(photo, { autoAlpha: 1, scale: 1, rotate: -0.6, duration: 0.75, ease: "power2.out" }, 0)
    .to(scene, { opacity: 0.58, filter: "grayscale(1) contrast(0.58) brightness(1.22) blur(3px)", duration: 1.15 }, 0.62)
    .to(scan, { opacity: 0.64, duration: 0.24 }, 1.02)
    .to(scan, { xPercent: 690, duration: 1.2, ease: "power1.inOut" }, 1.02)
    .to(scan, { opacity: 0, duration: 0.28 }, 2.06)
    .to(scene, { opacity: 1, filter: "grayscale(0.12) sepia(0.08) contrast(1.03) brightness(0.94) blur(0px)", scale: 1, duration: 1.55, ease: "power2.out" }, 1.36)
    .to(emulsion, { opacity: 0.04, duration: 1.45 }, 1.44)
    .to(grain, { backgroundPosition: "38px -27px", duration: 2.2, ease: "steps(8)" }, 0.42)
    .to(captionItems, { autoAlpha: 1, y: 0, stagger: 0.16, duration: 0.5 }, 2.46);

  if (reduceMotion) {
    tl.progress(1).pause();
    return null;
  }
  return createOnceTrigger(stage, tl, "top 75%");
}

function initHistoryTimeline(root, reduceMotion) {
  const stage = q(root, '[data-narrative-stage="timeline"]');
  if (!stage) return null;
  const progress = q(stage, ".ngl-history-timeline__progress");
  const nodes = qa(stage, ".ngl-history-node");
  const counter = q(stage, "[data-year-counter]");
  const ending = q(stage, ".ngl-history-timeline__ending");
  const progressLength = prepareDraw(progress);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

  tl.set(progress, { strokeDashoffset: progressLength })
    .set(counter, { textContent: 1948 })
    .set(nodes, { autoAlpha: 0, scale: 0.58, transformOrigin: "0 0" })
    .set(ending, { autoAlpha: 0, y: 18 })
    .to(progress, { strokeDashoffset: 0, duration: 5.6, ease: "none" }, 0)
    .to(counter, { textContent: 2026, snap: { textContent: 1 }, duration: 5.6, ease: "none" }, 0);

  [0.28, 1.85, 3.28, 4.82].forEach((position, index) => {
    tl.to(nodes[index], { autoAlpha: 1, scale: 1, duration: index === 1 ? 0.74 : 0.48, ease: "power2.out" }, position);
  });
  tl.to(ending, { autoAlpha: 1, y: 0, duration: 0.84 }, 4.88);

  if (reduceMotion) {
    tl.progress(1).pause();
    return null;
  }
  return ScrollTrigger.create({
    trigger: stage,
    start: "top 76%",
    end: () => `+=${Math.min(760, window.innerHeight * 0.9)}`,
    scrub: 0.8,
    animation: tl
  });
}

function initBarsToBridge(root, reduceMotion) {
  const stage = q(root, '[data-narrative-stage="barsBridge"]');
  if (!stage) return null;
  const lines = qa(stage, ".ngl-morph-line");
  const drawPaths = qa(stage, ".ngl-draw-path");
  const before = q(stage, ".ngl-bridge-copy--before");
  const after = q(stage, ".ngl-bridge-copy--after");
  const windowFrame = q(stage, ".ngl-window-frame");
  const dawn = q(stage, ".ngl-bridge-dawn");
  const hills = q(stage, ".ngl-bridge-hills");
  const river = q(stage, ".ngl-bridge-river");
  const sun = q(stage, ".ngl-bridge-sun");
  lines.forEach(saveLineStart);
  drawPaths.forEach(prepareDraw);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  tl.set(lines, {
    attr: {
      x1: (_, el) => el.dataset.startX1,
      y1: (_, el) => el.dataset.startY1,
      x2: (_, el) => el.dataset.startX2,
      y2: (_, el) => el.dataset.startY2
    },
    strokeWidth: 10,
    opacity: 1
  })
    .set(drawPaths, { strokeDashoffset: (_, el) => el.getTotalLength() })
    .set([dawn, hills, river, sun], { opacity: 0 })
    .set(windowFrame, { opacity: 1, scale: 1, transformOrigin: "50% 50%" })
    .set(before, { autoAlpha: 1, y: 0 })
    .set(after, { autoAlpha: 1, y: 0 })
    .to(before, { autoAlpha: 0, y: -18, duration: 0.65 }, 0.2)
    .to(windowFrame, { opacity: 0.16, scale: 1.04, duration: 1.05 }, 0.52)
    .to(dawn, { opacity: 0.9, duration: 1.7 }, 0.52)
    .to([hills, river], { opacity: 1, duration: 1.45, stagger: 0.16 }, 0.82)
    .to(lines, {
      attr: {
        x1: (_, el) => el.dataset.x1,
        y1: (_, el) => el.dataset.y1,
        x2: (_, el) => el.dataset.x2,
        y2: (_, el) => el.dataset.y2
      },
      strokeWidth: 5,
      stagger: 0.08,
      duration: 1.55
    }, 0.88)
    .to(drawPaths, { strokeDashoffset: 0, duration: 1.55, stagger: 0.08, ease: "power2.out" }, 1.34)
    .to(windowFrame, { opacity: 0, duration: 0.65 }, 1.52)
    .to(sun, { opacity: 0.86, scale: 1, duration: 1.1, ease: "power2.out" }, 1.82);

  if (reduceMotion) {
    tl.progress(1).pause();
    return null;
  }
  return ScrollTrigger.create({
    trigger: stage,
    start: "top 78%",
    end: () => `+=${Math.min(680, window.innerHeight * 0.8)}`,
    scrub: 0.6,
    animation: tl
  });
}

function initCityRoute(root, reduceMotion) {
  const stage = q(root, '[data-narrative-stage="cityRoute"]');
  if (!stage) return null;
  const routePath = q(stage, "#nglCityRoutePath");
  const runner = q(stage, ".ngl-route-runner");
  const nodes = qa(stage, ".ngl-route-node");
  const bridge = q(stage, ".ngl-city-bridge");
  const copyChildren = qa(stage, ".ngl-city-route__copy > *");
  const routeLength = prepareDraw(routePath);
  const bridgeLength = prepareDraw(bridge);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

  tl.set(routePath, { strokeDashoffset: routeLength })
    .set(bridge, { strokeDashoffset: bridgeLength, autoAlpha: 0 })
    .set(runner, { autoAlpha: 0, x: 0, y: 0 })
    .set(nodes, { autoAlpha: 0, scale: 0.45, transformOrigin: "0 0" })
    .set(copyChildren, { autoAlpha: 0, y: 14 })
    .to(copyChildren, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.1 }, 0.1)
    .to(routePath, { strokeDashoffset: 0, duration: 5, ease: "none" }, 0.46)
    .to(runner, { autoAlpha: 1, duration: 0.2 }, 0.46)
    .to(runner, {
      duration: 5,
      ease: "none",
      motionPath: { path: routePath, align: routePath, alignOrigin: [0.5, 0.5] }
    }, 0.46);

  [0.54, 1.72, 2.74, 3.68, 5.06].forEach((position, index) => {
    tl.to(nodes[index], { autoAlpha: 1, scale: 1, duration: 0.48, ease: "power2.out" }, position);
  });
  tl.to(bridge, { autoAlpha: 1, strokeDashoffset: 0, duration: 1 }, 3.55);

  if (reduceMotion || !MotionPathPlugin) {
    tl.progress(1).pause();
    return null;
  }
  return createOnceTrigger(stage, tl, "top 72%");
}

function initFinalLetterUnfold(root, reduceMotion) {
  const stage = q(root, '[data-narrative-stage="letterUnfold"]');
  if (!stage) return null;
  const shell = q(stage, ".ngl-letter-shell");
  const dawn = q(stage, ".ngl-letter-dawn");
  const topFold = q(stage, ".ngl-letter-fold--top");
  const bottomFold = q(stage, ".ngl-letter-fold--bottom");
  const content = q(stage, ".ngl-letter-content");
  const contentChildren = qa(content, ":scope > *");
  const threadPath = q(stage, ".ngl-letter-thread path");
  const threadLength = prepareDraw(threadPath);
  const targetHeight = Math.max(620, content.scrollHeight + 96);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  tl.set(shell, { height: 132, y: 38, scaleX: 0.94, autoAlpha: 1 })
    .set(dawn, { opacity: 0.16 })
    .set([topFold, bottomFold], { autoAlpha: 1, y: 0, rotate: 0 })
    .set(content, { clipPath: "inset(0 0 100% 0)" })
    .set(contentChildren, { autoAlpha: 0, y: 16 })
    .set(threadPath, { strokeDashoffset: threadLength })
    .to(topFold, { y: -74, rotate: -1.2, autoAlpha: 0, duration: 0.72 }, 0.32)
    .to(bottomFold, { y: 74, rotate: 1.2, autoAlpha: 0, duration: 0.72 }, 0.32)
    .to(shell, { height: targetHeight, y: 0, scaleX: 1, duration: 1.72, ease: "power2.inOut" }, 0.58)
    .to(dawn, { opacity: 0.9, duration: 2.0 }, 0.64)
    .to(content, { clipPath: "inset(0 0 0% 0)", duration: 1.56, ease: "power2.out" }, 1.08)
    .to(threadPath, { strokeDashoffset: 0, duration: 2.0, ease: "power1.inOut" }, 1.1)
    .to(contentChildren, { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.13, ease: "power2.out" }, 1.34);

  if (reduceMotion) {
    tl.progress(1).pause();
    return null;
  }
  return createOnceTrigger(stage, tl, "top 72%");
}

export function initNarrativeAnimations(root = document) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const triggers = [];
  const initialized = new WeakSet();
  const scenes = [
    { selector: '[data-narrative-stage="archiveDevelop"]', init: initArchiveDevelop },
    { selector: '[data-narrative-stage="timeline"]', init: initHistoryTimeline },
    { selector: '[data-narrative-stage="barsBridge"]', init: initBarsToBridge },
    { selector: '[data-narrative-stage="cityRoute"]', init: initCityRoute },
    { selector: '[data-narrative-stage="letterUnfold"]', init: initFinalLetterUnfold }
  ];

  const initScene = (sceneRoot, init) => {
    if (!sceneRoot || initialized.has(sceneRoot)) return;
    initialized.add(sceneRoot);
    const trigger = init(sceneRoot.ownerDocument, reduceMotion);
    if (trigger) triggers.push(trigger);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  if (!("IntersectionObserver" in window)) {
    scenes.forEach((scene) => initScene(q(root, scene.selector), scene.init));
    return () => triggers.forEach((trigger) => trigger.kill());
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const scene = scenes.find((item) => entry.target.matches(item.selector));
      if (!scene) return;
      observer.unobserve(entry.target);
      initScene(entry.target, scene.init);
    });
  }, {
    rootMargin: window.matchMedia("(max-width: 640px)").matches ? "520px 0px" : "900px 0px",
    threshold: 0.01
  });

  scenes.forEach((scene) => {
    const sceneRoot = q(root, scene.selector);
    if (sceneRoot) observer.observe(sceneRoot);
  });

  return () => {
    observer.disconnect();
    triggers.forEach((trigger) => trigger.kill());
  };
}
