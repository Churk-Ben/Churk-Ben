import assert from "node:assert/strict";
import { loadPosts } from "../.vitepress/content/posts.mjs";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 校验文章元数据、URL 唯一性与 slug 命名规范。 */
export function checkPosts() {
  const posts = loadPosts();

  assert.equal(new Set(posts.map((post) => post.url)).size, posts.length, "Duplicate article URLs");

  for (const post of posts) {
    const slug = post.url.replace(/^\/posts\//, "");
    assert(SLUG_PATTERN.test(slug), `${post.url}: slug must be lowercase kebab-case`);
  }

  return posts.length;
}
