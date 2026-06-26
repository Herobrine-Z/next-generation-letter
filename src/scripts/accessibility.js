export function setupModal({ button, shell, content, sourceNotes }) {
  const panel = shell.querySelector(".source-modal");
  let previousFocus = null;
  const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  const historyItem = (item) => {
    if (typeof item === "string") return `<p>${item}</p>`;
    const title = item.sourceUrl ? link(item.sourceUrl, item.title) : item.title;
    return `<p><strong>${title}</strong><br>${item.note}</p>`;
  };
  const imageRows = sourceNotes.images.map((item) => `
    <tr>
      <td>${item.file}</td>
      <td>${item.author}<br>${item.sourceUrl ? link(item.sourceUrl, item.title) : item.title}<br>${item.modified}</td>
      <td>${item.licenseUrl ? link(item.licenseUrl, item.license) : item.license}<br>访问：${item.accessed}</td>
    </tr>
  `).join("");

  content.innerHTML = `
    <h3>一、创作说明</h3>
    ${sourceNotes.creative.map((item) => `<p>${item}</p>`).join("")}
    <h3>二、历史资料来源</h3>
    ${sourceNotes.history.map(historyItem).join("")}
    <h3>三、图片与摄影许可</h3>
    <table>
      <thead><tr><th>文件</th><th>作者与来源</th><th>许可</th></tr></thead>
      <tbody>${imageRows}</tbody>
    </table>
    <h3>四、生成式工具辅助画面</h3>
    ${sourceNotes.ai.map((item) => `<p>${item}</p>`).join("")}
  `;

  const close = () => {
    shell.hidden = true;
    document.body.style.overflow = "";
    previousFocus?.focus();
  };

  const open = () => {
    previousFocus = document.activeElement;
    shell.hidden = false;
    document.body.style.overflow = "hidden";
    panel.focus();
  };

  button.addEventListener("click", open);
  shell.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !shell.hidden) close();
    if (event.key !== "Tab" || shell.hidden) return;
    const focusables = shell.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

export function setupMobileNav(button, nav) {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    nav.hidden = expanded;
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      button.setAttribute("aria-expanded", "false");
      nav.hidden = true;
    }
  });
}

export function setupArchiveDialog({ shell, entries }) {
  if (!shell) return;
  const panel = shell.querySelector(".archive-panel");
  const title = shell.querySelector("#archive-dialog-title");
  const content = shell.querySelector(".archive-panel__content");
  const eyebrow = shell.querySelector(".archive-panel__eyebrow");
  let previousFocus = null;

  const close = () => {
    if (shell.hidden) return;
    shell.hidden = true;
    document.body.style.overflow = "";
    previousFocus?.focus();
  };

  const open = (id, trigger) => {
    const entry = entries[id];
    if (!entry) return;
    previousFocus = trigger;
    eyebrow.textContent = entry.eyebrow || "档案";
    title.textContent = entry.title;
    content.innerHTML = entry.body.map((line) => `<p>${line}</p>`).join("");
    shell.hidden = false;
    document.body.style.overflow = "hidden";
    panel.focus();
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-archive-trigger]");
    if (trigger) open(trigger.dataset.archiveTrigger, trigger);
  });

  shell.querySelectorAll("[data-archive-close]").forEach((el) => el.addEventListener("click", close));

  document.addEventListener("keydown", (event) => {
    if (shell.hidden) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = shell.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
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
}
