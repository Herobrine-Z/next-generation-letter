import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createServer } from "node:net";
import { chromium } from "playwright";

const expectedHeight = 31600;
const output = "dist/next-generation-letter-1440x31600.png";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findAvailablePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        findAvailablePort(0).then(resolve, reject);
      } else {
        reject(error);
      }
    });
    server.once("listening", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : preferredPort;
      server.close(() => resolve(String(port)));
    });
    server.listen(Number(preferredPort), "127.0.0.1");
  });
}

async function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      await wait(400);
    }
  }
  throw new Error(`Preview server did not respond at ${url}`);
}

let server;
if (!existsSync("dist/index.html")) {
  console.warn("dist/index.html not found. Run npm run build before npm run capture.");
}

const port = await findAvailablePort(process.env.PORT || "4173");
const baseUrl = `http://127.0.0.1:${port}`;
const viteBin = resolve("node_modules/vite/bin/vite.js");
server = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", port], {
  stdio: "inherit",
  shell: false
});

try {
  await waitForServer(baseUrl);
  await mkdir("dist", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1
  });

  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`${baseUrl}/?capture=1`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));
  });
  await page.waitForTimeout(800);

  const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  console.log(`Capture height: ${height}px`);
  if (Math.abs(height - expectedHeight) > 12) {
    console.warn(`Warning: expected about ${expectedHeight}px, got ${height}px.`);
  }

  await page.screenshot({ path: output, fullPage: true, animations: "disabled" });
  console.log(`Wrote ${output}`);
  if (errors.length) {
    console.warn("Console/page errors:");
    errors.forEach((error) => console.warn(`- ${error}`));
  }
  await browser.close();
} finally {
  if (server?.pid) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      server.kill("SIGTERM");
    }
  }
}
