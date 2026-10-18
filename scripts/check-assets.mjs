import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import matter from "gray-matter";
import { createMarkdownRenderer } from "vitepress";
import { filesIn } from "./fs-utils.mjs";

const IMPORT_PATTERN = /from\s+['"]([^'"]+\.(?:png|jpe?g|svg|gif|webp|avif|ico))['"]/g;
const LITERAL_PATTERN = /["'](\/[\w./-]+\.(?:png|jpe?g|svg|gif|webp|avif|ico))["']/g;
const REMOTE_OR_ANCHOR = /^(?:[a-z]+:|\/\/|#)/i;

/** 与 theme/features/posts/banner.ts 的自动匹配顺序保持一致。 */
const BANNER_NAMES = ["banner", "cover"];
const BANNER_EXTENSIONS = ["avif", "webp", "png", "jpg", "jpeg", "gif", "svg"];

/**
 * 校验 Markdown 正文、头图、hero 图与主题源码引用的本地图片都存在，
 * 并返回被引用的资源集合，供 check-resources 判断是否存在孤儿资源。
 */
export async function checkAssets({ root, docs, theme }) {
  const markdown = await createMarkdownRenderer(docs);
  const referenced = new Set();

  const checkImage = (url, source) => {
    if (!url || REMOTE_OR_ANCHOR.test(url)) return;
    const path = decodeURI(url.split(/[?#]/)[0]);
    const file = path.startsWith("/") ? join(docs, "public", path) : resolve(dirname(source), path);
    assert(existsSync(file), `${relative(root, source)}: missing image ${url}`);
    referenced.add(file);
  };

  const checkTokens = (tokens, source) => {
    for (const token of tokens) {
      if (token.type === "image") checkImage(token.attrGet("src"), source);
      if (token.type === "html_inline" || token.type === "html_block") {
        for (const [, url] of token.content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/g)) checkImage(url, source);
      }
      if (token.children) checkTokens(token.children, source);
    }
  };

  /** 校验 frontmatter.banner，并把自动匹配到的 banner / cover 计入引用。 */
  const checkBanner = (data, source) => {
    if (data.banner === false) return;

    if (typeof data.banner === "string" && data.banner.trim()) {
      const url = data.banner.trim();
      if (REMOTE_OR_ANCHOR.test(url)) return;

      const path = decodeURI(url.split(/[?#]/)[0]);
      const file = path.startsWith("/")
        ? [join(docs, path), join(docs, "public", path)].find(existsSync)
        : resolve(dirname(source), path);

      assert(file, `${relative(root, source)}: missing banner ${url}`);
      referenced.add(file);
      return;
    }

    const directory = dirname(source);
    for (const name of BANNER_NAMES) {
      for (const folder of ["", "images"]) {
        for (const extension of BANNER_EXTENSIONS) {
          const banner = join(directory, folder, `${name}.${extension}`);
          if (existsSync(banner)) {
            referenced.add(banner);
            return;
          }
        }
      }
    }
  };

  const documents = filesIn(docs).filter((file) => file.endsWith(".md"));
  for (const file of documents) {
    const { content, data } = matter.read(file);
    checkTokens(markdown.parse(content, {}), file);
    checkImage(data.hero?.image?.src, file);
    checkBanner(data, file);
  }

  // 数据文件中的封面、头像等本地资源也要参与引用校验。
  const dataSources = filesIn(join(root, "data")).filter((file) => file.endsWith(".json"));
  const sources = [...filesIn(theme).filter((file) => /\.(vue|ts)$/.test(file)), ...dataSources];
  for (const file of sources) {
    const source = readFileSync(file, "utf8");
    for (const [, asset] of source.matchAll(IMPORT_PATTERN)) checkImage(asset, file);
    for (const [, asset] of source.matchAll(LITERAL_PATTERN)) checkImage(asset, file);
  }

  return { referenced, documents, sources };
}
