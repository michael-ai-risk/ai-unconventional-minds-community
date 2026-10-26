import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Local SSR dev server; the Cloudflare adapter is used by vite.config.ts for production builds.
export default defineConfig({
  plugins: [tanstackStart(), react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: { host: "127.0.0.1" },
});
