import { defineConfig } from "vitepress";
import { head } from "./configs/head.ts";
import { markdown } from "./configs/markdown.ts";
import { themeConfig } from "./configs/theme.ts";

/**
 * `@nolebase/ui` ships Google-hosted `@font-face` declarations that this theme never
 * applies. Drop their remote `src` so the built site loads no external fonts.
 */
type AtRule = {
  walkDecls(prop: string, cb: (decl: { value: string; remove: () => void }) => void): void;
};

function stripRemoteFonts() {
  return {
    postcssPlugin: "strip-remote-fonts",
    OnceExit(root: { walkAtRules(name: string, cb: (atRule: AtRule) => void): void }) {
      root.walkAtRules("font-face", (atRule) => {
        atRule.walkDecls("src", (decl) => {
          if (decl.value.includes("fonts.gstatic.com")) decl.remove();
        });
      });
    },
  };
}

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
      postcss: { plugins: [stripRemoteFonts()] },
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
