import type { DefaultTheme } from "vitepress";
import { loadPosts } from "../content/posts.mjs";

const navItems: DefaultTheme.SidebarItem[] = [
  { text: "文章", link: "/posts/" },
  { text: "导航", link: "/nav" },
  { text: "关于", link: "/about" },
  { text: "友链", link: "/links" },
];

const postItems: DefaultTheme.SidebarItem[] = loadPosts().map((post) => ({
  text: post.title,
  link: post.url,
}));

export const sidebar: DefaultTheme.SidebarMulti = {
  // 归档页保持导航侧栏（相对路径为 posts/index.md）
  "/posts/index.md": navItems,
  // 文章详情页在导航下方展开当前文章列表
  "/posts/": [{ text: "文章", link: "/posts/", collapsed: false, items: postItems }, ...navItems.slice(1)],
  // 其余页面使用导航侧栏
  "/": navItems,
};
