import { defineConfig } from "vite";

function localPagesBaseRewrite() {
  const pagesBase = "/next-generation-letter";
  const rewrite = (server) => {
    server.middlewares.use((req, _res, next) => {
      if (req.url === pagesBase) {
        req.url = "/";
      } else if (req.url?.startsWith(`${pagesBase}/`)) {
        req.url = req.url.slice(pagesBase.length) || "/";
      }
      next();
    });
  };

  return {
    name: "local-pages-base-rewrite",
    configureServer: rewrite,
    configurePreviewServer: rewrite
  };
}

export default defineConfig({
  base: "./",
  plugins: [localPagesBaseRewrite()],
  build: {
    target: "es2020",
    assetsInlineLimit: 0
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
