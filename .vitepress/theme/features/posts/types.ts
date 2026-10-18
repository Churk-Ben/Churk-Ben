export interface Post {
  url: string;
  title: string;
  date: string;
  tags: string[];
  /** frontmatter.banner：false 关闭头图，字符串自定义来源，缺省自动匹配。 */
  banner?: string | false;
}
