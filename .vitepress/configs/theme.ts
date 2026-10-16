import type { DefaultTheme } from "vitepress";
import { loadPosts } from "../content/posts.mjs";
import { footer } from "./footer.ts";
import { resolveIntegrations } from "./integrations.ts";
import { nav } from "./nav.ts";
import { docOptions } from "./site.ts";
import { socialLinks } from "./social.ts";

const postItems: DefaultTheme.SidebarItem[] = loadPosts().map((post) => ({ text: post.title, link: post.url }));

/** 由配置数据、文章元数据与环境变量组装主题配置。 */
export function buildThemeConfig(env: Record<string, string>): DefaultTheme.Config {
  return {
    nav,
    sidebar: [
      { text: "文章", link: "/posts/", collapsed: false, items: postItems },
      { text: "导航站", link: "/nav" },
      { text: "友链", link: "/links" },
      { text: "关于", link: "/about" },
    ],
    socialLinks,
    footer,
    ...docOptions,
    ...resolveIntegrations(env),
  };
}
