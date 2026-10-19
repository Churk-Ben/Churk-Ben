import { loadPosts } from "../.vitepress/content/posts.mjs";
import { input, select } from "./utils-prompt.mjs";
import { dataFiles, fail, readJson, requireInteractive, required, show, urlError, writeJson } from "./utils-new.mjs";

function linkOrPathError(value) {
  return value.startsWith("/") ? undefined : urlError(value);
}

export async function createRecommendation() {
  requireInteractive("pnpm new:home");

  const posts = loadPosts();
  const choice = await select({
    message: "选择要推荐的文章",
    options: [
      { label: "手动输入链接", value: "manual" },
      ...posts.map((post) => ({ label: post.title, hint: post.date, value: post.url })),
    ],
  });

  let url;
  let initialTitle = "";
  if (choice === "manual") {
    url = await input({ message: "链接（站内路径或完整 URL）", validate: linkOrPathError });
  } else {
    url = choice;
    initialTitle = posts.find((post) => post.url === choice)?.title ?? "";
  }

  const recommendations = readJson(dataFiles.home);
  if (recommendations.some((item) => item.url === url)) fail(`该链接已在首页推荐中：${url}`);

  const title = await input({ message: "标题", initial: initialTitle, validate: required });
  const desc = await input({ message: "一句话说明（可留空）", initial: "" });

  recommendations.push({
    title,
    ...(desc ? { desc } : {}),
    url,
  });
  writeJson(dataFiles.home, recommendations);
  console.log(`已添加 "${title}" 到 ${show(dataFiles.home)}`);
}
