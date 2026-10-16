import type { DefaultTheme } from "vitepress";
import { bilibiliSvg, githubSvg } from "../theme/assets/icons.ts";

/** 顶栏社交链接。 */
export const socialLinks: DefaultTheme.SocialLink[] = [
  { icon: { svg: bilibiliSvg }, link: "https://space.bilibili.com/319391312" },
  { icon: { svg: githubSvg }, link: "https://github.com/Churk-Ben" },
];
