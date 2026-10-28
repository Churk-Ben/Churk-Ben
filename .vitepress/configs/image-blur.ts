import type { MarkdownRenderer } from "vitepress";
import { getPlaceholderForSource } from "./image-placeholder.ts";

const REMOTE_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const MIN_WIDTH = 160;

/** 判断当前图片 token 是否位于链接内，避免 medium-zoom 抢占链接点击。 */
function isInsideLink(tokens: { type: string }[], index: number) {
  let depth = 0;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].type === "link_close") depth++;
    else if (tokens[i].type === "link_open") {
      if (depth === 0) return true;
      depth--;
    }
  }
  return false;
}

/**
 * 给 Markdown 正文图片加上模糊占位层。
 *
 * 图片仍由原来的 `<img>` 输出，VitePress / Vite 会正常处理相对路径与尺寸；
 * 这里只在外面包一层容器并插入内联的模糊图，等原图加载后由主题脚本淡入。
 */
export function imageBlurPlugin(md: MarkdownRenderer) {
  const defaultImage = md.renderer.rules.image;
  if (!defaultImage) return;

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const source = token.attrGet("src");
    const width = Number(token.attrGet("width"));
    const classes = token.attrGet("class") ?? "";

    if (!source || REMOTE_PATTERN.test(source) || (width && width < MIN_WIDTH) || classes.includes("no-blur")) {
      return defaultImage(tokens, idx, options, env, self);
    }

    const placeholder = getPlaceholderForSource(source, env.realPath ?? env.path);
    if (!placeholder) return defaultImage(tokens, idx, options, env, self);

    if (isInsideLink(tokens, idx)) token.attrJoin("class", "m-no-zoom");
    token.attrJoin("class", "m-image-content");

    const image = defaultImage(tokens, idx, options, env, self);
    return `<span class="m-image"><img class="m-image-blur" src="${placeholder}" alt="" aria-hidden="true" />${image}</span>`;
  };
}
