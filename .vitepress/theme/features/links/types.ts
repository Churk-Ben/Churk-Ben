import type { SiteIconName } from "../../assets/icons.ts";

/** 友链下的单个入口，例如 GitHub、博客或 RSS。 */
export interface FriendLinkItem {
  /** 图标标识，可用值见 theme/assets/icons.ts 的 siteIcons，默认 link。 */
  icon?: SiteIconName;
  /** 入口链接。 */
  url: string;
}

/** 友链数据条目，data/links.json 使用这一结构。 */
export interface FriendLink {
  /** 头像地址：docs/public 下的绝对路径，或远程 URL。 */
  avatar: string;
  /** 显示名称。 */
  name: string;
  /** 该友链的多个入口。 */
  links: FriendLinkItem[];
}
