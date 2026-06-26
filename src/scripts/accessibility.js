import { assetUrl } from "./asset-loader.js";
import { createDialogController } from "./dialog-controller.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function link(url, text) {
  return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>` : escapeHtml(text);
}

function renderHistoryItem(item) {
  if (typeof item === "string") return `<p>${escapeHtml(item)}</p>`;
  return `<p><strong>${link(item.sourceUrl, item.title)}</strong><br>${escapeHtml(item.note)}</p>`;
}

function renderImageRows(images = []) {
  return images.map((item) => `
    <tr>
      <td>${escapeHtml(item.file)}</td>
      <td>${escapeHtml(item.author)}<br>${link(item.sourceUrl, item.title)}<br>${escapeHtml(item.modified)}</td>
      <td>${link(item.licenseUrl, item.license)}<br>访问：${escapeHtml(item.accessed)}</td>
    </tr>
  `).join("");
}

function renderAuthorizationList(mediaSlots = []) {
  if (!mediaSlots.length) return "<p>何敬平烈士相关史料图片仍在联系授权中，本页不展示未授权缩略图。</p>";
  return `
    <ul class="source-auth-list">
      ${mediaSlots.map((slot) => `
        <li>
          <strong>${escapeHtml(slot.title)}</strong>
          <span>${escapeHtml(slot.institution === "待核实" ? "来源与权限核实中" : `${slot.institution}资料联系中`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderMediaSlot(slot, index) {
  const status = slot.status || "pending-authorization";
  const institutionText = slot.institution === "待核实" ? "来源与权限核实中" : `${slot.institution}资料联系中`;
  const placeholder = `
    <figure class="archive-media-slot" data-media-status="${escapeHtml(status)}" style="--slot-ratio: ${escapeHtml(slot.aspectRatio)}">
      <div class="archive-media-slot__placeholder" aria-label="${escapeHtml(`${slot.title}，史料图片待授权`)}">
        <span class="archive-media-slot__index">史料影像 ${String(index + 1).padStart(2, "0")}</span>
        <span class="archive-media-slot__title">${escapeHtml(slot.title)}</span>
        <span class="archive-media-slot__status">史料图片待授权</span>
        <span class="archive-media-slot__institution">${escapeHtml(institutionText)}</span>
      </div>
      <figcaption>${escapeHtml(slot.note || "取得正式许可后替换为馆藏图片")}</figcaption>
    </figure>
  `;

  if (status !== "authorized" || !slot.localAsset) return placeholder;

  return `
    <figure class="archive-media-slot" data-media-status="authorized" style="--slot-ratio: ${escapeHtml(slot.aspectRatio)}">
      <img src="${escapeHtml(assetUrl(slot.localAsset))}" alt="${escapeHtml(slot.alt)}" loading="lazy" decoding="async" data-slot-fallback="${escapeHtml(slot.id)}" />
      <figcaption>${escapeHtml(slot.note || slot.title)}</figcaption>
    </figure>
  `;
}

function wireSlotFallbacks(root, slots = []) {
  const byId = new Map(slots.map((slot, index) => [slot.id, { slot, index }]));
  root.querySelectorAll("img[data-slot-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const entry = byId.get(img.dataset.slotFallback);
      if (!entry) return;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = renderMediaSlot({ ...entry.slot, status: "pending-authorization", localAsset: "" }, entry.index);
      img.closest("figure")?.replaceWith(wrapper.firstElementChild);
    }, { once: true });
  });
}

function renderArchiveSection(section, allSlots) {
  const mediaSlots = (section.mediaSlotIds || [])
    .map((id) => allSlots.find((slot) => slot.id === id))
    .filter(Boolean);
  return `
    <section class="archive-record archive-record--${escapeHtml(section.id)}">
      <p class="archive-record__number">${escapeHtml(section.number)}</p>
      <h3>${escapeHtml(section.title)}</h3>
      ${section.fields ? `
        <dl class="archive-fields">
          ${section.fields.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
      ` : ""}
      ${section.timeline ? `
        <ol class="archive-record__timeline">
          ${section.timeline.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      ` : ""}
      ${section.poems ? `
        <div class="archive-poems" aria-label="诗作名称">
          ${section.poems.map((poem) => `<span>${escapeHtml(poem)}</span>`).join("")}
        </div>
      ` : ""}
      ${section.quote ? `<blockquote>${escapeHtml(section.quote)}</blockquote>` : ""}
      ${section.abstract ? `<div class="archive-abstract-mark" aria-hidden="true"><span>1949.11.27</span></div>` : ""}
      ${mediaSlots.length ? `<div class="archive-media-grid">${mediaSlots.map(renderMediaSlot).join("")}</div>` : ""}
    </section>
  `;
}

function renderArchiveEntry(entry, mediaSlots = []) {
  return `
    <div class="archive-records">
      ${entry.sections.map((section) => renderArchiveSection(section, mediaSlots)).join("")}
    </div>
    <p class="archive-boundary-note">${escapeHtml(entry.note)}</p>
  `;
}

export function setupModal({ button, shell, content, sourceNotes, mediaSlots = [] }) {
  if (!button || !shell || !content) return;
  const panel = shell.querySelector(".source-modal");

  content.innerHTML = `
    <section class="source-section">
      <h3>史料依据</h3>
      ${sourceNotes.history.map(renderHistoryItem).join("")}
    </section>
    <section class="source-section">
      <h3>图片与授权</h3>
      ${renderAuthorizationList(mediaSlots)}
      <table>
        <thead><tr><th>文件</th><th>作者与来源</th><th>许可</th></tr></thead>
        <tbody>${renderImageRows(sourceNotes.images)}</tbody>
      </table>
    </section>
    <section class="source-section">
      <h3>创作说明</h3>
      ${sourceNotes.creative.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      ${sourceNotes.ai.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
    </section>
  `;

  createDialogController({
    shell,
    panel,
    openTriggers: [button],
    closeTriggers: [...shell.querySelectorAll("[data-close]")],
    mode: "dialog"
  });
}

export function setupMobileNav(button, nav) {
  if (!button || !nav) return;
  const controller = createDialogController({
    shell: nav,
    panel: nav,
    openTriggers: [],
    closeTriggers: [],
    mode: "popover",
    lockScroll: false,
    onBeforeOpen: () => button.setAttribute("aria-expanded", "true"),
    onAfterClose: () => button.setAttribute("aria-expanded", "false")
  });

  button.addEventListener("click", () => {
    if (controller.isOpen()) {
      controller.close(true);
    } else {
      controller.open(button);
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) controller.close(true);
  });
}

export function setupArchiveDialog({ shell, entries, mediaSlots = [] }) {
  if (!shell) return;
  const panel = shell.querySelector(".archive-panel");
  const title = shell.querySelector("#archive-dialog-title");
  const content = shell.querySelector(".archive-panel__content");
  const eyebrow = shell.querySelector(".archive-panel__eyebrow");
  const controller = createDialogController({
    shell,
    panel,
    openTriggers: [],
    closeTriggers: [...shell.querySelectorAll("[data-archive-close]")],
    mode: "dialog"
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-archive-trigger]");
    if (!trigger) return;
    const entry = entries[trigger.dataset.archiveTrigger];
    if (!entry) return;
    eyebrow.textContent = entry.eyebrow || "档案";
    title.textContent = entry.title;
    content.innerHTML = renderArchiveEntry(entry, mediaSlots);
    wireSlotFallbacks(content, mediaSlots);
    controller.open(trigger);
  });
}
