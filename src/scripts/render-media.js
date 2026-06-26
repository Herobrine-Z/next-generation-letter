import { assetUrl, createImage } from "./asset-loader.js";

function createFrame(asset, index = 0) {
  const frame = document.createElement("figure");
  const roleClass = asset.role === "paper" ? "paper-frame" : asset.role === "wide" ? "film-frame film-frame--wide" : "film-frame";
  frame.className = roleClass;
  frame.dataset.reveal = asset.role === "archive" ? "archive" : "image";
  frame.style.setProperty("--asset-position", asset.position || "center");
  frame.append(createImage(asset, index < 2));
  frame.insertAdjacentHTML("beforeend", `<figcaption class="sr-only">${asset.alt || ""}</figcaption>`);
  return frame;
}

function renderRoadChapter(chapter) {
  const media = document.createElement("div");
  media.className = "chapter-media visual-stack visual-stack--road reveal";
  media.dataset.reveal = "image";
  const road = chapter.assets.find((asset) => asset.role === "wide");
  const archive = chapter.assets.find((asset) => asset.role === "archive");
  if (road) media.append(createFrame(road, 0));
  if (archive) media.append(createFrame(archive, 1));
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
      .forEach((asset, frameIndex) => media.append(createFrame(asset, frameIndex + 1)));
    return media;
  }

  if (chapter.id === "ending") {
    media.className = "chapter-media final-letter reveal";
    media.dataset.reveal = "archive";
    const paper = chapter.assets.find((asset) => asset.role === "paper");
    const letter = document.createElement("div");
    letter.className = "letter-paper letter-paper--final";
    if (paper) {
      letter.style.setProperty("--paper-image", `url("${assetUrl(paper.src)}")`);
    }
    letter.innerHTML = chapter.letter.map((line) => `<p>${line}</p>`).join("");
    media.append(letter);
    return media;
  }

  chapter.assets
    .filter((asset) => asset.role !== "overlay" && (asset.role !== "hero" || asset.duplicateInMedia))
    .slice(0, 4)
    .forEach((asset, frameIndex) => media.append(createFrame(asset, frameIndex)));

  return media;
}
