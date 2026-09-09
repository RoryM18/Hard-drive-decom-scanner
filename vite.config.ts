import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // allows access through a tunnel (e.g. cloudflared/ngrok) whose hostname
    // Vite wouldn't otherwise recognize
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
  },
});
