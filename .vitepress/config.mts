import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";
import { katex } from "@mdit/plugin-katex";

export default defineConfig({
  title: "Churk's Blog",
  description: "Aurore est le billet-doux de Polaris.",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: [],

  head: [
    ["link", { rel: "icon", href: "/img/icon.png" }],
    ["link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" }],
  ],

  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: "提示",
      warningLabel: "注意",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详情",
    },
    config: (md) => {
      md.use(katex, {
        strict: (errorCode: string) =>
          errorCode === "unicodeTextInMathMode" ? "ignore" : "warn",
      });
    },
  },

  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "博文", link: "/posts/" },
      { text: "关于", link: "/readme" },
      { text: "友链", link: "/links" },
    ],

    sidebar: (() => {
      const raw = generateSidebar({
        documentRootPath: ".",
        scanStartPath: ".",
        resolvePath: "/",
        useTitleFromFileHeading: true,
        useFolderTitleFromIndexFile: true,
        includeFolderIndexFile: false,
        sortMenusByFrontmatterOrder: true,
        frontmatterOrderDefaultValue: 99,
        collapsed: false,
        excludeByGlobPattern: [],
      });
      const prefixSlash = (items: any) => {
        for (const item of items) {
          if (item.link && !item.link.startsWith("/"))
            item.link = "/" + item.link;
          if (item.items) prefixSlash(item.items);
        }
      };
      prefixSlash(raw);
      return raw;
    })(),

    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Churk-Ben" },
    ],

    outline: {
      label: "本页目录",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    footer: {
      message: "萌ICP备 20250835 号",
      copyright: "Copyright © 2024-present Churk Ben",
    },
  },
});
