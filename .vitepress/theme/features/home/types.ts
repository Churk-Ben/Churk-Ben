/** 首页推荐阅读条目，data/home.json 使用这一结构。 */
export interface Recommendation {
  /** 标题。 */
  title: string;
  /** 一句话说明。 */
  desc?: string;
  /** 站内路径或完整 URL。 */
  url: string;
}
