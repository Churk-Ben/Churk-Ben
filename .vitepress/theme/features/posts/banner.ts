import { withBase } from "vitepress";

const EXTENSIONS = ["avif", "webp", "png", "jpg", "jpeg", "gif", "svg"];
const NAMES = ["banner", "cover"];
const REMOTE = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

const images = import.meta.glob(
  [
    "../../../../docs/posts/**/*.{avif,webp,png,jpg,jpeg,gif,svg}",
    // 优化脚本保留的原图不参与构建，避免把 .raw 备份打进产物。
    "!../../../../docs/posts/**/*.raw.*",
  ],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

/** 把 Vite glob key 归一化为 srcDir 相对路径（posts/...），方便按文章目录查找图片。 */
const sources = Object.fromEntries(
  Object.entries(images).map(([key, url]) => {
    const marker = "docs/posts/";
    const index = key.lastIndexOf(marker);
    return [index === -1 ? key : `posts/${key.slice(index + marker.length)}`, url];
  }),
);

function normalize(path: string) {
  const parts: string[] = [];
  for (const part of path.replaceAll("\\", "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

/** 支持远程地址、站点根路径（public）与相对文章目录的本地图片。 */
function resolveSource(value: string, directory: string) {
  if (REMOTE.test(value)) return value;

  const path = normalize(value.startsWith("/") ? value : `${directory}/${value}`);
  if (sources[path]) return sources[path];

  return value.startsWith("/") ? withBase(value) : "";
}

function detectSource(directory: string) {
  for (const name of NAMES) {
    for (const folder of ["", "images/"]) {
      for (const extension of EXTENSIONS) {
        const url = sources[`${directory}/${folder}${name}.${extension}`];
        if (url) return url;
      }
    }
  }
  return "";
}

/** 解析页面头图：false 关闭；字符串指定来源；缺省自动匹配文章目录下的 banner / cover 图片。 */
export function getBannerSource(banner: unknown, directory: string) {
  if (banner === false) return "";
  if (typeof banner === "string" && banner.trim()) return resolveSource(banner.trim(), directory);

  return detectSource(directory);
}
