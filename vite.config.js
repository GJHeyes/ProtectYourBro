import { defineConfig } from "vite";

export default defineConfig({
  base: "/ProtectYourBro/",
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
