import type { DefaultTheme } from "vitepress";

type Env = Record<string, string>;

/**
 * 从环境变量读取访客徽章与 Giscus 评论配置；未配置时返回 undefined，对应组件不渲染。
 * 变量名与示例见仓库根目录 `.env.example`。
 */
export function resolveIntegrations(env: Env): Pick<DefaultTheme.Config, "visitor" | "comment"> {
  const visitor: DefaultTheme.Config["visitor"] = env.VISITOR_BADGE_ID ? { badgeId: env.VISITOR_BADGE_ID } : undefined;

  const { GISCUS_REPO, GISCUS_REPO_ID, GISCUS_CATEGORY, GISCUS_CATEGORY_ID } = env;
  const comment: DefaultTheme.Config["comment"] =
    GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY && GISCUS_CATEGORY_ID
      ? {
          repo: GISCUS_REPO as `${string}/${string}`,
          repoId: GISCUS_REPO_ID,
          category: GISCUS_CATEGORY,
          categoryId: GISCUS_CATEGORY_ID,
        }
      : undefined;

  return { visitor, comment };
}
