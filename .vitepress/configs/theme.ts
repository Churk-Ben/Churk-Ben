import type { DefaultTheme } from "vitepress";
import { loadPosts } from "../content/posts.mjs";
import { bilibiliSvg, githubSvg } from "../theme/icons.ts";

export const themeConfig: DefaultTheme.Config = {
  nav: [
    { text: "首页", link: "/" },
    { text: "文章", link: "/posts/" },
    { text: "导航站", link: "/nav" },
    { text: "关于我", link: "/about" },
    { text: "友链", link: "/links" },
  ],
  sidebar: [
    {
      text: "文章",
      link: "/posts/",
      collapsed: false,
      items: loadPosts().map((post) => ({ text: post.title, link: post.url })),
    },
    { text: "导航站", link: "/nav" },
    { text: "友链", link: "/links" },
    { text: "关于", link: "/about" },
  ],
  search: { provider: "local" },
  socialLinks: [
    { icon: { svg: bilibiliSvg }, link: "https://space.bilibili.com/319391312" },
    { icon: { svg: githubSvg }, link: "https://github.com/Churk-Ben" },
  ],
  outline: { label: "本页目录" },
  docFooter: { prev: "上一页", next: "下一页" },
  lastUpdated: {
    text: "最后更新",
    formatOptions: { dateStyle: "short", timeStyle: "medium" },
  },
  footer: {
    message: "萌ICP备 20250835 号",
    copyright: "Copyright © 2026 Churk Ben",
  },
};
