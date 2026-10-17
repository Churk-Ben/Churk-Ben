import type { DefaultTheme } from "vitepress";
import { slugify } from "@mdit-vue/shared";
import { loadPosts } from "../content/posts.mjs";
import { navData } from "../theme/features/nav/data.ts";

const postItems: DefaultTheme.SidebarItem[] = loadPosts().map((post) => ({
  text: post.title,
  link: post.url,
}));

const navSectionItems: DefaultTheme.SidebarItem[] = navData.map((group) => ({
  text: group.title,
  link: `/nav#${slugify(group.title)}`,
}));

/** 全站共用一套侧栏：文章与导航为可折叠列表，关于和友链保持单页入口。 */
export const sidebar: DefaultTheme.Sidebar = [
  {
    text: "文章",
    link: "/posts/",
    collapsed: true,
    items: postItems,
  },
  {
    text: "导航",
    link: "/nav",
    collapsed: true,
    items: navSectionItems,
  },
  { text: "关于", link: "/about" },
  { text: "友链", link: "/links" },
];
