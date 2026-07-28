import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { prerender } from "./prerender";

export default defineConfig({
  plugins: [tailwindcss(), prerender()],
  build: { manifest: true },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api/github-proxy": {
        target: "https://api.github.com",
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, "http://localhost");
          const ghPath = url.searchParams.get("path") ?? "";
          const qs = url.searchParams.get("qs");
          return `${ghPath}${qs ? `?${qs}` : ""}`;
        },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Flick-Web",
        },
      },
    },
  },
});
