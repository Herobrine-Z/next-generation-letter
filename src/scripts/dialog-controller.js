import gsap from "gsap";

const activeControllers = new Set();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollLock = null;
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isMobileDrawer(mode) {
  return mode === "drawer";
}

function getFocusables(root) {
  return [...root.querySelectorAll(focusableSelector)].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function syncScrollLock() {
  const locked = [...activeControllers].some((controller) => controller.locksScroll && controller.isOpen());
  if (locked && !scrollLock) {
    scrollLock = {
      x: window.scrollX,
      y: window.scrollY,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
      bodyOverflow: document.body.style.overflow,
      htmlScrollBehavior: document.documentElement.style.scrollBehavior
    };
    document.documentElement.classList.add("dialog-open");
    document.body.classList.add("dialog-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLock.y}px`;
    document.body.style.left = `-${scrollLock.x}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  } else if (!locked && scrollLock) {
    const { x, y, bodyPosition, bodyTop, bodyLeft, bodyRight, bodyWidth, bodyOverflow, htmlScrollBehavior } = scrollLock;
    scrollLock = null;
    document.documentElement.classList.remove("dialog-open");
    document.body.classList.remove("dialog-open");
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.position = bodyPosition;
    document.body.style.top = bodyTop;
    document.body.style.left = bodyLeft;
    document.body.style.right = bodyRight;
    document.body.style.width = bodyWidth;
    document.body.style.overflow = bodyOverflow;
    window.scrollTo({ top: y, left: x, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: x, behavior: "auto" });
      document.documentElement.style.scrollBehavior = htmlScrollBehavior;
    });
  }
}

export function createDialogController({
  shell,
  panel,
  openTriggers = [],
  closeTriggers = [],
  mode = "dialog",
  lockScroll = mode !== "popover",
  onBeforeOpen,
  onAfterOpen,
  onBeforeClose,
  onAfterClose
}) {
  if (!shell || !panel) return null;

  const triggers = Array.isArray(openTriggers) ? openTriggers.filter(Boolean) : [openTriggers].filter(Boolean);
  const closers = Array.isArray(closeTriggers) ? closeTriggers.filter(Boolean) : [closeTriggers].filter(Boolean);
  const backdrop = shell === panel ? null : shell.firstElementChild;
  let previousFocus = null;
  let timeline = null;
  let isOpen = !shell.hidden;

  const setHidden = (hidden) => {
    shell.hidden = hidden;
    if (shell !== panel) panel.hidden = false;
  };

  const focusPanel = () => panel.focus({ preventScroll: true });

  const animateOpen = () => {
    timeline?.kill();
    if (reduceMotion.matches) {
      gsap.set([backdrop, panel].filter(Boolean), { clearProps: "all", autoAlpha: 1, y: 0, yPercent: 0, scale: 1 });
      onAfterOpen?.();
      focusPanel();
      return;
    }

    const drawer = isMobileDrawer(mode);
    timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        timeline = null;
        onAfterOpen?.();
        focusPanel();
      }
    });

    if (backdrop) timeline.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: drawer ? 0.44 : 0.42 }, 0);
    if (mode === "popover") {
      timeline.fromTo(panel, { autoAlpha: 0, y: 12, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.32 }, 0);
    } else if (drawer) {
      timeline.fromTo(panel, { autoAlpha: 1, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.48 }, 0);
    } else {
      timeline.fromTo(panel, { autoAlpha: 0, y: 22, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.46 }, 0);
    }
  };

  const animateClose = (restoreFocus = true) => {
    timeline?.kill();
    if (reduceMotion.matches) {
      setHidden(true);
      isOpen = false;
      activeControllers.delete(api);
      syncScrollLock();
      onAfterClose?.();
      if (restoreFocus) previousFocus?.focus?.({ preventScroll: true });
      return;
    }

    const drawer = isMobileDrawer(mode);
    timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        timeline = null;
        setHidden(true);
        isOpen = false;
        activeControllers.delete(api);
        syncScrollLock();
        onAfterClose?.();
        if (restoreFocus) previousFocus?.focus?.({ preventScroll: true });
      }
    });

    if (mode === "popover") {
      timeline.to(panel, { autoAlpha: 0, y: 12, scale: 0.98, duration: 0.22 }, 0);
    } else if (drawer) {
      timeline.to(panel, { autoAlpha: 1, yPercent: 100, duration: 0.34 }, 0);
    } else {
      timeline.to(panel, { autoAlpha: 0, y: 16, duration: 0.28 }, 0);
    }
    if (backdrop) timeline.to(backdrop, { autoAlpha: 0, duration: 0.28 }, 0);
  };

  const api = {
    open(trigger = document.activeElement) {
      if (isOpen) return;
      activeControllers.forEach((controller) => {
        if (controller !== api) controller.close(false);
      });
      previousFocus = trigger;
      onBeforeOpen?.();
      setHidden(false);
      panel.scrollTop = 0;
      isOpen = true;
      activeControllers.add(api);
      syncScrollLock();
      animateOpen();
    },
    close(restoreFocus = true) {
      if (!isOpen && shell.hidden) return;
      onBeforeClose?.();
      animateClose(restoreFocus);
    },
    isOpen() {
      return isOpen;
    },
    locksScroll: lockScroll
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", () => api.open(trigger)));
  closers.forEach((closer) => closer.addEventListener("click", () => api.close(true)));
  backdrop?.addEventListener("click", (event) => {
    if (event.target === backdrop) api.close(true);
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      api.close(true);
      return;
    }
    if (event.key !== "Tab" || mode === "popover") return;
    const focusables = getFocusables(panel);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return api;
}
