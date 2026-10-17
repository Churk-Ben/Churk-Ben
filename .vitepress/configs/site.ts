import type { DefaultTheme } from "vitepress";

/** 站点标识 */
export const site = {
  title: "Churk's Blog",
  description: "Aurore est le billet-doux de Polaris.",
  lang: "zh-CN",
} as const;

/** 通用文案 */
export const docOptions = {
  search: { provider: "local" },
  outline: { label: "本页目录" },
  docFooter: { prev: false, next: false },
  lastUpdated: { text: "最后更新", formatOptions: { dateStyle: "short", timeStyle: "medium" } },
} satisfies Pick<DefaultTheme.Config, "search" | "outline" | "docFooter" | "lastUpdated">;
