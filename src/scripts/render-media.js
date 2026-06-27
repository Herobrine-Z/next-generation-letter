import { createImage } from "./asset-loader.js";
import { renderFinalLetterUnfold } from "./narrative-markup.js";

function createFrame(asset, eager = false) {
  const frame = document.createElement("figure");
  const roleClass = asset.role === "paper" ? "paper-frame" : asset.role === "wide" ? "film-frame film-frame--wide" : "film-frame";
  frame.className = roleClass;
  frame.dataset.reveal = asset.role === "archive" ? "archive" : "image";
  frame.dataset.mobileFit = asset.mobileFit || (asset.role === "paper" ? "contain" : "cover");
  frame.dataset.mobilePriority = asset.mobilePriority || defaultMobilePriority(asset);
  frame.dataset.mediaMode = frame.dataset.mobileFit === "contain" ? "contain" : "";
  frame.style.setProperty("--asset-position", asset.position || "center");
  frame.style.setProperty("--asset-position-mobile", asset.mobilePosition || asset.position || "center");
  frame.style.setProperty("--asset-ratio-mobile", asset.mobileRatio || (asset.role === "wide" ? "16 / 9" : "16 / 10"));
  frame.append(createImage(asset, eager));
  frame.insertAdjacentHTML("beforeend", `<figcaption class="sr-only">${asset.alt || ""}</figcaption>`);
  return frame;
}

function defaultMobilePriority(asset) {
  if (asset.role === "hero") return "primary";
  if (asset.role === "wide" || asset.role === "paper" || asset.role === "support") return "secondary";
  return "supplement";
}

function createSupplementDetails(assets) {
  if (!assets.length) return null;
  const details = document.createElement("details");
  details.className = "mobile-media-more";
  details.innerHTML = `
    <summary>查看补充影像</summary>
    <div class="mobile-media-more__grid"></div>
  `;
  const grid = details.querySelector(".mobile-media-more__grid");
  assets.forEach((asset) => grid.append(createFrame(asset)));
  return details;
}

function appendDesktopSupplements(media, assets) {
  assets.forEach((asset) => {
    const frame = createFrame(asset);
    frame.classList.add("desktop-supplement-media");
    media.append(frame);
  });
}

function splitMobileAssets(assets) {
  const direct = [];
  const supplements = [];
  assets.forEach((asset) => {
    const priority = asset.mobilePriority || defaultMobilePriority(asset);
    if (priority === "supplement" || direct.length >= 2) {
      supplements.push(asset);
    } else {
      direct.push(asset);
    }
  });
  return { direct, supplements };
}

function renderRoadChapter(chapter) {
  const media = document.createElement("div");
  media.className = "chapter-media visual-stack visual-stack--road reveal";
  media.dataset.reveal = "image";
  const primary = chapter.assets.find((asset) => asset.role === "hero");
  const road = chapter.assets.find((asset) => asset.role === "wide");
  const archive = chapter.assets.find((asset) => asset.role === "archive");
  if (primary) {
    const primaryFrame = createFrame(primary, false);
    primaryFrame.classList.add("mobile-only-media");
    media.append(primaryFrame);
  }
  if (road) media.append(createFrame(road));
  if (archive) appendDesktopSupplements(media, [archive]);
  const details = createSupplementDetails(archive ? [archive] : []);
  if (details) media.append(details);
  return media;
}

export function renderMedia(chapter, index) {
  if (chapter.id === "ordinary-life") {
    return renderRoadChapter(chapter);
  }

  const media = document.createElement("div");
  media.className = "chapter-media visual-stack reveal";
  media.dataset.reveal = "image";

  if (chapter.id === "too-light") {
    media.innerHTML = `
      <div class="letter-paper letter-paper--draft">
        <p data-typewriter="${chapter.letterDraft.join("\n")}"></p>
        <p>只用<span class="strike-word" style="--strike-progress:0">很好</span>两个字，怎么能够回答一生？</p>
      </div>
    `;
    chapter.assets
      .filter((asset) => asset.role !== "hero" && asset.role !== "overlay")
      .forEach((asset) => {
        if ((asset.mobilePriority || defaultMobilePriority(asset)) === "supplement") {
          appendDesktopSupplements(media, [asset]);
          const details = createSupplementDetails([asset]);
          if (details) media.append(details);
        } else {
          media.append(createFrame(asset));
        }
      });
    return media;
  }

  if (chapter.id === "ending") {
    return renderFinalLetterUnfold(chapter);
  }

  const mobileHero = chapter.assets.find((asset) => asset.role === "hero" && !asset.duplicateInMedia);
  if (mobileHero) {
    const heroFrame = createFrame(mobileHero, index <= 1);
    heroFrame.classList.add("mobile-only-media");
    media.append(heroFrame);
  }

  const visibleAssets = chapter.assets
    .filter((asset) => asset.role !== "overlay" && (asset.role !== "hero" || asset.duplicateInMedia))
    .slice(0, 4);
  const { direct, supplements } = splitMobileAssets(visibleAssets);
  direct.forEach((asset, frameIndex) => media.append(createFrame(asset, index <= 1 && frameIndex === 0)));
  appendDesktopSupplements(media, supplements);
  const details = createSupplementDetails(supplements);
  if (details) media.append(details);

  return media;
}
