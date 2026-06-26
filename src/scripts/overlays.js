import { createImage } from "./asset-loader.js";

export function createOverlays(chapter) {
  const overlays = chapter.assets.filter((asset) => asset.role === "overlay");
  if (!overlays.length) return null;

  const shell = document.createElement("div");
  shell.className = "chapter-overlays";
  shell.setAttribute("aria-hidden", "true");

  overlays.forEach((asset) => {
    const img = createImage(asset);
    img.className = `chapter-overlay chapter-overlay--${asset.overlayType || "soft"}`;
    img.style.setProperty("--asset-position", asset.position || "center");
    shell.append(img);
  });

  return shell;
}
