import { computed } from "vue";
import { useData, useRoute } from "vitepress";

/**
 * 获取当前页面的 pageId 用于页面统计和评论（默认为去掉 base 的 route.path）
 */
export function usePageId() {
  const { frontmatter, site } = useData();
  const route = useRoute();

  return computed(() => frontmatter.value.pageId || route.path.replace(site.value.base.replace(/\/$/, ""), ""));
}
