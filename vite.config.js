// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        apps: resolve(__dirname, "apps.html"),
        mcts_floor: resolve(__dirname, "apps/MCTS_floor.html"),

        // Add more entries if you have more HTML files
      },
    },
  },
});
