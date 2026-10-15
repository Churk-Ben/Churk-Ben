import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { createMarkdownRenderer } from "vitepress";
import { loadPosts } from "../.vitepress/content/posts.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const docs = join(root, "docs");
const theme = join(root, ".vitepress/theme");
const markdown = await createMarkdownRenderer(docs);
const referencedAssets = new Set();

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

function checkImage(url, source) {
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) return;
  const path = decodeURI(url.split(/[?#]/)[0]);
  const file = path.startsWith("/") ? join(docs, "public", path) : resolve(dirname(source), path);
  assert(existsSync(file), `${relative(root, source)}: missing image ${url}`);
  referencedAssets.add(file);
}

function checkTokens(tokens, source) {
  for (const token of tokens) {
    if (token.type === "image") checkImage(token.attrGet("src"), source);
    if (token.type === "html_inline" || token.type === "html_block") {
      for (const [, url] of token.content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/g)) checkImage(url, source);
    }
    if (token.children) checkTokens(token.children, source);
  }
}

const documents = filesIn(docs).filter((file) => file.endsWith(".md"));
for (const file of documents) {
  const { content, data } = matter.read(file);
  checkTokens(markdown.parse(content, {}), file);
  checkImage(data.hero?.image?.src, file);
}

const sourceFiles = filesIn(theme);
for (const file of sourceFiles.filter((file) => /\.(vue|ts)$/.test(file))) {
  const source = readFileSync(file, "utf8");
  for (const [, asset] of source.matchAll(/from\s+['"]([^'"]+\.(?:png|jpe?g|svg|gif|webp|avif))['"]/g))
    checkImage(asset, file);
  if (file.endsWith(".vue")) {
    assert(
      !/\s(?::?style)\s*=|\bonerror\s*=|\.style\./.test(source),
      `${relative(root, file)}: use classes and Vue state instead of inline styles`,
    );
  }
}

const resources = [...filesIn(docs), ...sourceFiles].filter((file) =>
  /\.(png|jpe?g|svg|gif|webp|avif)$/.test(extname(file)),
);
const hashes = new Map();
for (const file of resources) {
  assert(referencedAssets.has(file), `Unreferenced resource: ${relative(root, file)}`);
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  assert(!hashes.has(hash), `Duplicate resource: ${relative(root, file)} and ${hashes.get(hash)}`);
  hashes.set(hash, relative(root, file));
}

const posts = loadPosts();
assert.equal(new Set(posts.map((post) => post.url)).size, posts.length, "Duplicate article URLs");
console.log(
  `Checked ${posts.length} articles, ${documents.length} Markdown files and ${resources.length} resources. No missing, unused or duplicate resources; no inline styles in Vue components.`,
);
