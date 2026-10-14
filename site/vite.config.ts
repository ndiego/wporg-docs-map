import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DATA_DIR = path.resolve(import.meta.dirname, "../data");
const DATASETS = ["documentation-map.json", "rosetta.json"];

// Copies the datasets to the root of dist so both pages can link to them (and the dev server can serve them).
function copyData(): Plugin {
  let outDir = "dist";
  return {
    name: "copy-datasets",
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir);
    },
    configureServer(server) {
      for (const name of DATASETS) {
        server.middlewares.use(`/${name}`, (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(readFileSync(path.join(DATA_DIR, name)));
        });
      }
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true });
      for (const name of DATASETS) {
        const src = path.join(DATA_DIR, name);
        if (existsSync(src)) copyFileSync(src, path.join(outDir, name));
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), copyData()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@data": DATA_DIR,
    },
  },
  build: {
    rollupOptions: {
      // Two pages: the documentation map at the root, the Rosetta sites at rosetta/.
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        rosetta: path.resolve(import.meta.dirname, "rosetta/index.html"),
      },
    },
  },
  server: { fs: { allow: [".."] } },
});
