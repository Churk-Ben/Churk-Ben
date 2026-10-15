import { defineConfig } from "vitepress";
import { head } from "./configs/head";
import { markdown } from "./configs/markdown";
import { themeConfig } from "./configs/theme";

export default defineConfig({
  title: "Churk's Blog",
  description: "Aurore est le billet-doux de Polaris.",
  lang: "zh-CN",
  srcDir: "docs",
  srcExclude: ["drafts/**"],
  cleanUrls: true,
  lastUpdated: true,
  // Article folders keep their original published URLs.
  rewrites: { "posts/:slug/index.md": "posts/:slug.md" },
  head,
  markdown,
  themeConfig,
  vite: {
    css: {
      preprocessorOptions: {
        scss: { api: "modern-compiler" },
      },
    },
    optimizeDeps: {
      exclude: ["@nolebase/vitepress-plugin-enhanced-readabilities/client", "vitepress", "@nolebase/ui"],
    },
    ssr: {
      noExternal: ["@nolebase/vitepress-plugin-enhanced-readabilities", "@nolebase/ui"],
    },
  },
});
