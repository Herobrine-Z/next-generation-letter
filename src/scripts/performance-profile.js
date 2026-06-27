export function getPerformanceProfile() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallViewport = window.matchMedia("(max-width: 640px)").matches;
  const saveData = navigator.connection?.saveData === true;
  const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;

  if (reduceMotion || saveData || lowCpu || lowMemory) return "lite";
  if (coarsePointer || smallViewport) return "balanced";
  return "full";
}

export function applyPerformanceProfile(profile = getPerformanceProfile()) {
  document.documentElement.dataset.performance = profile;
  return profile;
}
