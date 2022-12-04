import { defineConfig } from "vite";

export default defineConfig({
  base: "https://github.com/GJHeyes/ProtectYourBro",
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
