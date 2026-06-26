export function setupModal({ button, shell, content, sourceNotes }) {
  const panel = shell.querySelector(".source-modal");
  let previousFocus = null;
  const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  const historyItem = (item) => {
    if (typeof item === "string") return `<p>${item}</p>`;
    const title = item.sourceUrl ? link(item.sourceUrl, item.title) : item.title;
    return `<p><strong>${title}</strong><br>${item.note}</p>`;
  };
  content.innerHTML = `
    <h3>一、创作说明</h3>
    ${sourceNotes.creative.map((item) => `<p>${item}</p>`).join("")}
    <h3>二、历史资料来源</h3>
    ${sourceNotes.history.map(historyItem).join("")}
    <h3>三、图片与摄影许可</h3>
    <table>
      <thead><tr><th>文件</th><th>作者与来源</th><th>许可</th></tr></thead>
      <tbody>
        ${sourceNotes.images.map((item) => `
          <tr>
            <td>${item.file}</td>
            <td>${item.author}<br>${link(item.sourceUrl, item.title)}<br>${item.modified}</td>
            <td>${link(item.licenseUrl, item.license)}<br>访问：${item.accessed}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <h3>四、AI 辅助画面</h3>
    ${sourceNotes.ai.map((item) => `<p>${item}</p>`).join("")}
    <h3>五、原创拍摄素材</h3>
    ${sourceNotes.originals.map((item) => `<p>${item}</p>`).join("")}
    <h3>六、仍需人工确认</h3>
    <ul>${sourceNotes.pending.map((item) => `<li>${item}</li>`).join("")}</ul>
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
