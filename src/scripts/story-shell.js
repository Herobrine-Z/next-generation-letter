import { createDialogController } from "./dialog-controller.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function setupStoryShell(chapters) {
  const shell = document.querySelector(".story-shell");
  const drawer = document.querySelector(".story-shell-drawer");
  const list = drawer?.querySelector("[data-story-drawer-list]");
  const menuButton = shell?.querySelector("[data-story-menu]");
  const sourceButton = shell?.querySelector("[data-story-sources]");
  if (!shell || !drawer || !list || !menuButton) {
    return { sourceButton: null, setActiveChapter() {} };
  }

  list.innerHTML = chapters.map((chapter) => `
    <a href="#${escapeHtml(chapter.id)}" data-story-chapter-link="${escapeHtml(chapter.id)}">
      <span>${escapeHtml(chapter.number)}</span>
      <strong>${escapeHtml(chapter.shortTitle || chapter.title)}</strong>
    </a>
  `).join("");

  const controller = createDialogController({
    shell: drawer,
    panel: drawer.querySelector(".story-shell-drawer__panel"),
    openTriggers: [menuButton],
    closeTriggers: [...drawer.querySelectorAll("[data-story-drawer-close]")],
    mode: window.matchMedia("(max-width: 640px)").matches ? "drawer" : "dialog",
    onBeforeOpen: () => menuButton.setAttribute("aria-expanded", "true"),
    onAfterClose: () => menuButton.setAttribute("aria-expanded", "false")
  });

  list.addEventListener("click", (event) => {
    if (event.target.closest("a")) controller?.close(true);
  });

  const number = shell.querySelector(".story-shell__number");
  const title = shell.querySelector(".story-shell__title");
  const setActiveChapter = (chapter) => {
    if (!chapter) return;
    if (number) number.textContent = chapter.number;
    if (title) title.textContent = chapter.shortTitle || chapter.title;
    list.querySelectorAll("a").forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${chapter.id}`);
    });
  };

  setActiveChapter(chapters[0]);
  return { sourceButton, setActiveChapter };
}
