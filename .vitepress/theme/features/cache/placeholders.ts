/** 头图与封面图的模糊占位图，按构建后的图片地址索引。 */
const images = import.meta.glob(
  ["../../../../docs/posts/**/*.{avif,webp,png,jpg,jpeg,gif,svg}", "!../../../../docs/posts/**/*.raw.*"],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const placeholders = import.meta.glob(
  ["../../../../docs/posts/**/*.{avif,webp,png,jpg,jpeg,gif,svg}", "!../../../../docs/posts/**/*.raw.*"],
  {
    eager: true,
    query: "?lqip",
    import: "default",
  },
) as Record<string, string>;

const byUrl = new Map<string, string>();

for (const key of Object.keys(images)) {
  if (!/(?:^|\/)(?:banner|cover)\.[^/]+$/i.test(key)) continue;

  const url = images[key];
  const placeholder = placeholders[key];
  if (url && placeholder) byUrl.set(url, placeholder);
}

/** 远程图片或没有占位图时返回 undefined。 */
export function getBannerPlaceholder(source?: string) {
  return source ? byUrl.get(source) : undefined;
}
