import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadPosts } from "../.vitepress/content/posts.mjs";
import { input, isInteractive } from "./prompt.mjs";
import { fail, required, root, show } from "./new-utils.mjs";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const today = new Date().toISOString().slice(0, 10);

function slugError(value) {
  if (!value) return "不能为空";
  if (!SLUG_PATTERN.test(value)) return "请使用小写字母、数字和短横线，例如 my-first-post";
  if (existsSync(join(root, "docs/posts", value))) return `文章目录已存在：docs/posts/${value}`;
  return undefined;
}

function dateError(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "请使用 YYYY-MM-DD 格式";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "日期无效";
  return undefined;
}

function parseTags(value) {
  return [
    ...new Set(
      value
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

export async function createPost(args) {
  let [slug, ...titleParts] = args;
  let title = titleParts.join(" ").trim();
  const complete = Boolean(slug && title);

  if (slug && !SLUG_PATTERN.test(slug)) {
    fail(`Invalid slug "${slug}": use lowercase kebab-case, e.g. my-first-post`);
  }
  if (slug && existsSync(join(root, "docs/posts", slug))) {
    fail(`Post already exists: docs/posts/${slug}`);
  }

  if (!slug || !title) {
    if (!isInteractive()) fail('用法: pnpm new:post <slug> "<标题>"');
    slug = slug || (await input({ message: "文章 slug", hint: "小写字母、数字和短横线", validate: slugError }));
    title = title || (await input({ message: "文章标题", validate: required }));
  }

  let date = today;
  let tags = [];

  if (!complete) {
    const knownTags = [...new Set(loadPosts().flatMap((post) => post.tags))];
    date = await input({ message: "日期", initial: today, validate: dateError });
    tags = parseTags(
      await input({
        message: "标签（逗号分隔，可留空）",
        initial: "",
        hint: knownTags.length ? `已有标签：${knownTags.join("、")}` : undefined,
      }),
    );
  }

  const directory = join(root, "docs/posts", slug);
  const file = join(directory, "index.md");
  const content = `---
title: ${JSON.stringify(title)}
date: ${date}
tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]
---

# ${title}

正文。
`;

  mkdirSync(directory, { recursive: true });
  writeFileSync(file, content, "utf8");
  console.log(`Created ${show(file)}`);
  console.log(`截图请放在 ${show(join(directory, "images"))}/`);
}
