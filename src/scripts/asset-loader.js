import { assetMetadata } from "./asset-metadata.js";

const assetModules = import.meta.glob("../assets/**/*", {
  eager: true,
  query: "?url",
  import: "default"
});

export function assetUrl(path) {
  return assetModules[`../assets/${path}`] || new URL(`../assets/${path}`, import.meta.url).href;
}

function responsiveCandidates(path) {
  const metadata = assetMetadata[path];
  if (!metadata) return [];
  const variants = metadata.variants.map((variant) => ({
    width: variant.width,
    url: assetUrl(variant.src)
  }));
  return [...variants, { width: metadata.width, url: assetUrl(path) }]
    .sort((a, b) => a.width - b.width)
    .filter((candidate, index, list) => list.findIndex((item) => item.width === candidate.width) === index);
}

function defaultSizes(asset) {
  if (asset.role === "hero" || asset.role === "overlay") return "100vw";
  if (asset.role === "wide") return "(max-width: 767px) 88vw, (max-width: 1200px) 56vw, 760px";
  if (asset.role === "archive") return "(max-width: 767px) 86vw, (max-width: 1200px) 44vw, 560px";
  if (asset.role === "paper") return "(max-width: 767px) 86vw, 720px";
  return "(max-width: 767px) 86vw, 520px";
}

function preferredFallback(path) {
  const candidates = responsiveCandidates(path);
  if (!candidates.length) return assetUrl(path);
  return (candidates.find((candidate) => candidate.width >= 768) || candidates[candidates.length - 1]).url;
}

export function imageAttributes(path, options = {}) {
  const metadata = assetMetadata[path];
  const candidates = responsiveCandidates(path);
  const attrs = {
    src: preferredFallback(path),
    decoding: "async",
    loading: options.loading || "lazy",
    fetchpriority: options.fetchPriority || "auto",
    width: options.width || metadata?.width,
    height: options.height || metadata?.height,
    sizes: options.sizes,
    srcset: candidates.length > 1 ? candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ") : undefined
  };
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}="${String(value).replaceAll('"', "&quot;")}"`)
    .join(" ");
}

export function createImage(asset, eager = false) {
  const img = document.createElement("img");
  const metadata = assetMetadata[asset.src];
  const candidates = responsiveCandidates(asset.src);
  img.src = preferredFallback(asset.src);
  img.alt = asset.decorative ? "" : asset.alt || "";
  img.classList.toggle("asset-img--real", Boolean(asset.real));
  img.classList.toggle("asset-img--historical", Boolean(asset.historical));
  img.classList.toggle("asset-img--ai", Boolean(asset.ai));
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  img.fetchPriority = eager ? "high" : "auto";
  if (metadata) {
    img.width = metadata.width;
    img.height = metadata.height;
  }
  if (candidates.length > 1) {
    img.srcset = candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
    img.sizes = asset.sizes || defaultSizes(asset);
  }
  img.style.setProperty("--asset-position", asset.position || "center");
  img.addEventListener("error", () => {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    placeholder.innerHTML = `<span>素材未加载：${asset.src}<br>建议画面：${asset.alt || "装饰叠加"}</span>`;
    img.replaceWith(placeholder);
  }, { once: true });
  return img;
}

export function preloadCaptureImages(root = document) {
  if (document.documentElement.dataset.capture !== "true") return;
  root.querySelectorAll("img[loading='lazy']").forEach((img) => {
    img.loading = "eager";
  });
}
