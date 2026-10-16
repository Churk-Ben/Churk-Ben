import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [slug, ...rest] = process.argv.slice(2);
const title = rest.join(" ").trim();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!slug || !title) {
  console.error('Usage: pnpm new-post <slug> "<标题>"');
  process.exit(1);
}

if (!slugPattern.test(slug)) {
  console.error(`Invalid slug "${slug}": use lowercase kebab-case, e.g. my-first-post`);
  process.exit(1);
}

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = join(root, "docs/posts", slug);

if (existsSync(directory)) {
  console.error(`Post already exists: docs/posts/${slug}`);
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const content = `---
title: ${title}
date: ${date}
tags: []
---

# ${title}

正文。
`;

mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, "index.md"), content, "utf8");
console.log(`Created docs/posts/${slug}/index.md — 截图请放在 docs/posts/${slug}/images/`);
