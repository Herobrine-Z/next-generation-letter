import "../styles/layout.css";
import "../styles/components.css";
import "../styles/sections.css";
import "../styles/animations.css";
import "../styles/narrative.css";
import "../styles/envelope-intro.css";
import "../styles/responsive.css";
import { chapters, heJingpingArchive, heJingpingMediaSlots, sourceNotes } from "./content.js";
import { createImage, preloadCaptureImages } from "./asset-loader.js";
import { createRedThread } from "./red-thread.js";
import { renderMedia } from "./render-media.js";
import { createOverlays } from "./overlays.js";
import { refreshScrollScenes, setupChapterProgress, setupScrollScenes, setupNavSpy } from "./scroll-scenes.js";
import { setupArchiveDialog, setupModal, setupMobileNav } from "./accessibility.js";
import { setupEnvelopeIntro } from "./envelope-intro.js";
import { setupAudioController } from "./audio-controller.js";
import { initNarrativeAnimations } from "./narrative-animations.js";
import { renderNarrativeBlock } from "./narrative-markup.js";

const params = new URLSearchParams(window.location.search);
if (params.get("capture") === "1") {
  document.documentElement.dataset.capture = "true";
}

const story = document.querySelector(".story");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderProfileCard(profile) {
  if (!profile) return "";
  return `
    <div class="real-archive-card" data-reveal="archive">
      <div>
        <strong>${escapeHtml(profile.name)}</strong>
        <span>${escapeHtml(profile.years)}</span>
        ${profile.details.map((detail) => `<p>${escapeHtml(detail)}</p>`).join("")}
        <button class="archive-trigger" type="button" data-archive-trigger="archive-he-jingping">档案 01</button>
      </div>
    </div>
  `;
}

function renderTimeline(items) {
  if (!items?.length) return "";
  return `
    <ol class="thin-timeline" aria-label="极简时间线" data-reveal="archive">
      ${items.map((item) => `<li><time>${escapeHtml(item.date)}</time><span>${escapeHtml(item.text)}</span></li>`).join("")}
    </ol>
  `;
}

function renderSafeLines(lines = []) {
  return lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
}

function renderHeading(chapter, index) {
  const tag = index === 0 ? "h1" : "h2";
  const className = index === 0 ? "chapter-title chapter-title--cover" : "chapter-title";
  const content = chapter.titleLines?.length ? renderSafeLines(chapter.titleLines) : escapeHtml(chapter.title);
  return `<${tag} id="${chapter.id}-title" class="${className}">${content}</${tag}>`;
}

function renderChapter(chapter, index) {
  const section = document.createElement("section");
  section.id = chapter.id;
  section.className = `chapter-section story-chapter ${chapter.theme}`;
  section.style.setProperty("--section-height", `${chapter.height}px`);
  section.setAttribute("aria-labelledby", `${chapter.id}-title`);
  section.dataset.chapter = "";
  section.dataset.chapterIndex = chapter.number;
  section.dataset.chapterTitle = chapter.title;
  section.dataset.chapterShortTitle = chapter.shortTitle;

  const hero = chapter.assets.find((asset) => asset.role === "hero") || chapter.assets[0];
  if (hero) {
    const bg = document.createElement("div");
    bg.className = "asset-bg";
    bg.style.setProperty("--asset-position", hero.position || "center");
    bg.style.setProperty("--asset-position-mobile", hero.mobilePosition || hero.position || "center");
    bg.dataset.mobileFit = hero.mobileFit || "cover";
    bg.append(createImage(hero, index === 0));
    section.append(bg);
  }

  const overlays = createOverlays(chapter);
  if (overlays) section.append(overlays);

  section.insertAdjacentHTML("beforeend", `<div class="grain" aria-hidden="true"></div>`);
  if (index === 0) {
    const dust = document.createElement("div");
    dust.className = "dust";
    dust.innerHTML = Array.from({ length: 18 }, (_, i) => `<span style="left:${8 + (i * 17) % 84}%;top:${10 + (i * 23) % 76}%"></span>`).join("");
    section.append(dust);
  }

  const inner = document.createElement("div");
  inner.className = "chapter-section__inner";

  const copy = document.createElement("div");
  copy.className = "chapter-copy reveal";
  copy.dataset.reveal = "text";
  copy.innerHTML = [
    `<span class="chapter-number">${chapter.number}</span>`,
    chapter.label ? `<p class="chapter-label">${escapeHtml(chapter.label)}</p>` : "",
    `<p class="eyebrow">${chapter.eyebrowLines?.length ? renderSafeLines(chapter.eyebrowLines) : escapeHtml(chapter.eyebrow)}</p>`,
    renderHeading(chapter, index),
    chapter.lead ? chapter.lead.map((line) => `<p>${escapeHtml(line)}</p>`).join("") : "",
    chapter.quote ? `<blockquote>${escapeHtml(chapter.quote)}</blockquote>` : "",
    chapter.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join(""),
    renderProfileCard(chapter.profileCard),
    renderTimeline(chapter.timeline),
    chapter.replySentence ? `<p class="reply-sentence" data-typewriter="${escapeHtml(chapter.replySentence)}"></p>` : ""
  ].join("");

  inner.append(copy, renderMedia(chapter, index));
  section.append(inner);

  const narrativeBlock = renderNarrativeBlock(chapter);
  if (narrativeBlock) section.append(narrativeBlock);

  if (chapter.id === "city-answer") {
    section.insertAdjacentHTML("beforeend", `<div class="transition-lines" aria-hidden="true"></div>`);
  }

  return section;
}

story.innerHTML = createRedThread(chapters);
chapters.forEach((chapter, index) => story.append(renderChapter(chapter, index)));

const nav = document.querySelector(".chapter-nav");
const mobileNav = document.querySelector(".mobile-nav");
nav.innerHTML = chapters.map((chapter) => `<a href="#${chapter.id}" data-title="${escapeHtml(chapter.title)}">${chapter.number}</a>`).join("");
mobileNav.innerHTML = chapters.map((chapter) => `<a href="#${chapter.id}">${chapter.number} ${escapeHtml(chapter.shortTitle)}</a>`).join("");

setupMobileNav(document.querySelector(".mobile-progress"), mobileNav);
setupModal({
  button: document.querySelector(".source-button"),
  shell: document.querySelector(".modal-shell"),
  content: document.querySelector(".source-modal__content"),
  sourceNotes,
  mediaSlots: heJingpingMediaSlots
});
setupArchiveDialog({
  shell: document.querySelector(".archive-shell"),
  entries: {
    "archive-he-jingping": heJingpingArchive
  },
  mediaSlots: heJingpingMediaSlots
});
preloadCaptureImages(story);

const audio = setupAudioController(document.querySelector(".audio-player"));
let storyInitialized = false;
function enterStory(event) {
  if (storyInitialized) return;
  storyInitialized = true;
  setupScrollScenes();
  initNarrativeAnimations(story);
  setupNavSpy(chapters);
  setupChapterProgress(chapters, audio);
  requestAnimationFrame(() => refreshScrollScenes(true));
  window.setTimeout(() => story.focus({ preventScroll: true }), 0);
}

window.addEventListener("envelope:intro-complete", enterStory);
setupEnvelopeIntro({ audio });
