export function auditHorizontalOverflow(root = document.body) {
  if (!import.meta.env.DEV || !root) return [];

  const viewportWidth = window.visualViewport?.width || document.documentElement.clientWidth;
  const ignoredFixed = ".audio-player, .mobile-progress, .chapter-progress";
  const ignoredDecor = ".red-thread, .red-thread *, .chapter-overlays, .chapter-overlay, .ngl-archive-develop__scan";
  const offenders = [...root.querySelectorAll("*")]
    .filter((element) => {
      const style = getComputedStyle(element);
      if (style.position === "fixed" && element.matches(ignoredFixed)) return false;
      if (element.matches(ignoredDecor)) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
    })
    .map((element) => ({
      element,
      className: element.className,
      rect: element.getBoundingClientRect()
    }));

  if (offenders.length) console.table(offenders);
  return offenders;
}
