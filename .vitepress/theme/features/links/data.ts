import type { DefaultTheme } from "vitepress";
import { resolveSiteIcon } from "../../assets/icons.ts";
import linksData from "../../../../data/links.json" with { type: "json" };
import type { FriendLink } from "./types.ts";

/** 友链数据维护在 data/links.json，这里把图标名映射为内联 SVG。 */
export const friendLinks: DefaultTheme.TeamMember[] = (linksData as FriendLink[]).map(
  ({ avatar, name, desc, links }) => ({
    avatar,
    name,
    ...(desc ? { desc } : {}),
    links: links.map(({ icon, url }) => ({ icon: { svg: resolveSiteIcon(icon) }, link: url })),
  }),
);
