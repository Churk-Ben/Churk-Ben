import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadPosts } from "../.vitepress/content/posts.mjs";
import { input, isInteractive, select } from "./utils-prompt.mjs";
import { fail, required, root, show } from "./utils-new.mjs";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_DIR = join(root, "docs/posts");
const PRIVATE_DIR = join(root, "private/posts");
const today = new Date().toISOString().slice(0, 10);

function slugError(value, baseDir) {
  if (!value) return "不能为空";
  if (!SLUG_PATTERN.test(value)) return "请使用小写字母、数字和短横线，例如 my-first-post";
  if (existsSync(join(baseDir, value))) return `文章目录已存在：${baseDir}/${value}`;
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

export async function createPost(rawArgs, options = {}) {
  const args = rawArgs.filter((argument) => argument !== "--private" && argument !== "-p");
  let [slug, ...titleParts] = args;
  let title = titleParts.join(" ").trim();
  let isPrivate = Boolean(options.private) || rawArgs.includes("--private") || rawArgs.includes("-p");
  const complete = Boolean(slug && title);

  if (slug && !SLUG_PATTERN.test(slug)) {
    fail(`无效的 slug "${slug}"：请使用小写 kebab-case，例如 my-first-post`);
  }
  if (slug && existsSync(join(isPrivate ? PRIVATE_DIR : PUBLIC_DIR, slug))) {
    fail(`文章已存在：${isPrivate ? "private/posts" : "docs/posts"}/${slug}`);
  }

  if (!slug || !title) {
    if (!isInteractive()) {
      fail('用法：pnpm new:post <slug> "<标题>" [--private] / pnpm new:private <slug> "<标题>"');
    }

    if (!isPrivate) {
      const kind = await select({
        message: "文章类型",
        options: [
          { label: "公开文章", value: "public", hint: "docs/posts/<slug>/index.md" },
          { label: "隐私文章", value: "private", hint: "private/posts/<slug>/index.md" },
        ],
      });
      isPrivate = kind === "private";
    }

    const baseDir = isPrivate ? PRIVATE_DIR : PUBLIC_DIR;
    slug =
      slug ||
      (await input({
        message: "文章 slug",
        hint: "小写字母、数字和短横线",
        validate: (value) => slugError(value, baseDir),
      }));
    title = title || (await input({ message: "文章标题", validate: required }));
  }

  const baseDir = isPrivate ? PRIVATE_DIR : PUBLIC_DIR;
  if (slug && existsSync(join(baseDir, slug))) {
    fail(`文章已存在：${isPrivate ? "private/posts" : "docs/posts"}/${slug}`);
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

  const directory = join(baseDir, slug);
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
  console.log(`已创建 ${show(file)}`);

  if (isPrivate) {
    console.log(
      "隐私文章源不会被提交。编辑后运行 pnpm private:build，再提交 docs/private/ 与 docs/public/private/ 下的生成文件。",
    );
  } else {
    console.log(`截图请放在 ${show(join(directory, "images"))}/`);
  }
}
