import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { typewriter } from "./typewriter.js";

gsap.registerPlugin(ScrollTrigger);

function revealVars(kind, isSmallMobile) {
  const distance = isSmallMobile ? 14 : 26;
  if (kind === "image") {
    return {
      from: { autoAlpha: 0, y: isSmallMobile ? 10 : 18, scale: 1.025 },
      to: { autoAlpha: 1, y: 0, scale: 1, duration: isSmallMobile ? 0.55 : 0.82 }
    };
  }
  if (kind === "archive") {
    return {
      from: { autoAlpha: 0, x: isSmallMobile ? 8 : 16 },
      to: { autoAlpha: 1, x: 0, duration: isSmallMobile ? 0.5 : 0.72 }
    };
  }
  return {
    from: { autoAlpha: 0, y: distance },
    to: { autoAlpha: 1, y: 0, duration: isSmallMobile ? 0.58 : 0.86 }
  };
}

export function refreshScrollScenes(force = false) {
  ScrollTrigger.refresh(force);
}

export function setupScrollScenes() {
  const isCapture = document.documentElement.dataset.capture === "true";
  const mm = gsap.matchMedia();

  if (isCapture) {
    document.querySelectorAll(".reveal, [data-reveal]").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    return () => {};
  }

  gsap.defaults({ ease: "power2.out", duration: 0.8 });

  mm.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      isDesktop: "(min-width: 1025px)",
      isSmallMobile: "(max-width: 640px)"
    },
    (context) => {
      const { reduceMotion, isDesktop, isSmallMobile } = context.conditions;
      const revealTargets = gsap.utils.toArray("[data-reveal]");

      if (reduceMotion) {
        gsap.set(revealTargets, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        gsap.set(".thread-path", { strokeDashoffset: 0 });
        gsap.set(".strike-word", { "--strike-progress": 1 });
        return;
      }

      revealTargets.forEach((el) => {
        const vars = revealVars(el.dataset.reveal || "text", isSmallMobile);
        gsap.fromTo(el, vars.from, {
          ...vars.to,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 84%",
            once: true
          }
        });
      });

      if (!isSmallMobile) {
        gsap.utils.toArray(".asset-bg img").forEach((img) => {
          gsap.fromTo(img, { scale: 1.05 }, {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".chapter-section"),
              start: "top bottom",
              end: "bottom top",
              scrub: isDesktop ? 1.2 : 0.4
            }
          });
        });
      }

      const path = document.querySelector(".thread-path");
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".story",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8
          }
        });
      }

      gsap.set(".strike-word", { "--strike-progress": 0 });

      if (!isSmallMobile) {
        gsap.to(".chapter-overlay--steam", {
          yPercent: -3,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: ".ordinary-road",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.4
          }
        });
        gsap.to(".chapter-overlay--fog", {
          xPercent: 2,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: ".ordinary-road",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.6
          }
        });
        gsap.to(".chapter-overlay--plum", {
          yPercent: 4,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: ".remembrance",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.8
          }
        });
      }
    }
  );

  const typeTargets = gsap.utils.toArray("[data-typewriter]");
  typeTargets.forEach((typeTarget) => {
    ScrollTrigger.create({
      trigger: typeTarget,
      start: "top 75%",
      once: true,
      onEnter: () => typewriter(typeTarget, typeTarget.dataset.typewriter).then(() => {
        if (typeTarget.closest(".letter-paper--draft")) {
          gsap.to(".strike-word", { "--strike-progress": 1, duration: 0.9, ease: "power2.out" });
        }
      })
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  return () => mm.revert();
}

export function setupNavSpy(chapters) {
  const navLinks = [...document.querySelectorAll(".chapter-nav a")];
  const mobileLabel = document.querySelector(".mobile-progress span");
  chapters.forEach((chapter) => {
    ScrollTrigger.create({
      trigger: `#${chapter.id}`,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;
        navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${chapter.id}`));
        if (mobileLabel) mobileLabel.textContent = chapter.number;
      }
    });
  });
}

export function setupChapterProgress(chapters) {
  const root = document.querySelector("[data-chapter-progress]");
  if (!root) return () => {};

  const fill = root.querySelector(".chapter-progress__fill");
  const number = root.querySelector(".chapter-progress__number");
  const title = root.querySelector(".chapter-progress__title");
  const setProgress = gsap.quickSetter(root, "--story-progress");

  const setActive = (chapter) => {
    if (!chapter) return;
    number.textContent = chapter.number;
    title.textContent = chapter.shortTitle || chapter.title;
  };

  if (fill) gsap.set(fill, { transformOrigin: "top" });
  setActive(chapters[0]);

  ScrollTrigger.create({
    trigger: ".story",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => setProgress(self.progress.toFixed(4))
  });

  chapters.forEach((chapter) => {
    ScrollTrigger.create({
      trigger: `#${chapter.id}`,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) setActive(chapter);
      }
    });
  });
}
