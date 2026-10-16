import type { DefaultTheme } from "vitepress";

/** 站点标识，供 VitePress 顶层配置使用。 */
export const site = {
  title: "Churk's Blog",
  description: "Aurore est le billet-doux de Polaris.",
  lang: "zh-CN",
} as const;

/** 文档页通用行为与文案。 */
export const docOptions = {
  search: { provider: "local" },
  outline: { label: "本页目录" },
  docFooter: { prev: "上一页", next: "下一页" },
  lastUpdated: { text: "最后更新", formatOptions: { dateStyle: "short", timeStyle: "medium" } },
} satisfies Pick<DefaultTheme.Config, "search" | "outline" | "docFooter" | "lastUpdated">;
