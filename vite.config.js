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
        research_articles: resolve(__dirname, "research-articles.html"),
        DYNUTOP: resolve(__dirname, "research-articles/real-time-topology-optimization-via-learnable-mappings.html"),

        // Add more entries if you have more HTML files
      },
    },
    // assetsInclude: ['research-articles//DYNUTOP/3DBridge_TC_FCM/*.json']

  },
});

