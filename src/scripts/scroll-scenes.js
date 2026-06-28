import { gsap, ScrollTrigger } from "./gsap-setup.js";
import { typewriter } from "./typewriter.js";

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

let refreshTimer;

export function scheduleScrollRefresh(force = true) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.refresh(force);
  }, 180);
}

function performanceProfile() {
  return document.documentElement.dataset.performance || "full";
}

function setupMobileReveal(revealTargets, reduceMotion) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    gsap.set(revealTargets, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: "willChange" });
    return () => {};
  }

  gsap.set(revealTargets, { autoAlpha: 0, y: 14, willChange: "opacity, transform" });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      gsap.to(entry.target, {
        autoAlpha: 1,
        y: 0,
        duration: performanceProfile() === "lite" ? 0.32 : 0.48,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => gsap.set(entry.target, { clearProps: "willChange" })
      });
    });
  }, {
    rootMargin: "90px 0px",
    threshold: 0.01
  });

  revealTargets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

function setupScrollRefreshWatchers() {
  const events = [
    [window, "resize"],
    [window, "orientationchange"]
  ];
  const onLayoutChange = () => scheduleScrollRefresh(true);

  events.forEach(([target, eventName]) => {
    target.addEventListener(eventName, onLayoutChange, { passive: true });
  });

  window.visualViewport?.addEventListener("resize", onLayoutChange, { passive: true });
  window.visualViewport?.addEventListener("scroll", onLayoutChange, { passive: true });

  document.fonts?.ready?.then(onLayoutChange);

  const images = gsap.utils.toArray("img");
  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", onLayoutChange, { once: true });
    img.addEventListener("error", onLayoutChange, { once: true });
  });

  return () => {
    window.clearTimeout(refreshTimer);
    events.forEach(([target, eventName]) => {
      target.removeEventListener(eventName, onLayoutChange);
    });
    window.visualViewport?.removeEventListener("resize", onLayoutChange);
    window.visualViewport?.removeEventListener("scroll", onLayoutChange);
    images.forEach((img) => {
      img.removeEventListener("load", onLayoutChange);
      img.removeEventListener("error", onLayoutChange);
    });
  };
}

export function setupScrollScenes() {
  const isCapture = document.documentElement.dataset.capture === "true";
  const profile = performanceProfile();
  const mm = gsap.matchMedia();
  const cleanupRefreshWatchers = setupScrollRefreshWatchers();
  const cleanupVisibility = setupTimelineVisibility();

  if (isCapture) {
    document.querySelectorAll(".reveal, [data-reveal]").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    return () => {
      cleanupRefreshWatchers();
      cleanupVisibility();
    };
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

      if (isSmallMobile) {
        return setupMobileReveal(revealTargets, reduceMotion);
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

      if (!isSmallMobile && profile === "full") {
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
        if (document.querySelector(".chapter-overlay--steam")) {
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
        }
        if (document.querySelector(".chapter-overlay--fog")) {
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
        }
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

  window.addEventListener("load", () => scheduleScrollRefresh(true), { once: true });
  return () => {
    cleanupRefreshWatchers();
    cleanupVisibility();
    mm.revert();
  };
}

function setupTimelineVisibility() {
  let pausedForHidden = false;
  const pause = () => {
    if (!document.hidden) return;
    pausedForHidden = true;
    gsap.globalTimeline.pause();
  };
  const resume = () => {
    if (!pausedForHidden) return;
    pausedForHidden = false;
    gsap.globalTimeline.resume();
    scheduleScrollRefresh(true);
  };
  const handleVisibility = () => {
    if (document.hidden) pause();
    else resume();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pagehide", pause);
  window.addEventListener("pageshow", resume);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("pagehide", pause);
    window.removeEventListener("pageshow", resume);
  };
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

export function setupChapterProgress(chapters, audio, storyShell) {
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
    if (chapter.id === "city-answer") {
      audio?.setAmbient?.("city", { crossfade: true });
    } else if (["prologue", "archive", "three-days", "too-light"].includes(chapter.id)) {
      audio?.setAmbient?.("dark", { crossfade: true });
    }
    storyShell?.setActiveChapter?.(chapter);
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
