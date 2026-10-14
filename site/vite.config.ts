import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DATA = path.resolve(import.meta.dirname, "../data/documentation-map.json");

// Copies the dataset next to index.html so the page can link to it (and the dev server can serve it).
function copyData(): Plugin {
  let outDir = "dist";
  return {
    name: "copy-documentation-map",
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use("/documentation-map.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(readFileSync(DATA));
      });
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(DATA, path.join(outDir, "documentation-map.json"));
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), copyData()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@data": path.resolve(import.meta.dirname, "../data"),
    },
  },
  server: { fs: { allow: [".."] } },
});
