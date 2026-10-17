import { createFriendLink } from "./new-link.mjs";
import { createNavLink } from "./new-nav.mjs";
import { createPost } from "./new-post.mjs";
import { createRecommendation } from "./new-home.mjs";
import { isInteractive, PromptCancelledError, select } from "./prompt.mjs";

const USAGE = `用法：
  pnpm new                        交互选择要创建的内容
  pnpm new:post [slug] ["标题"]   新建文章
  pnpm new:nav                    添加导航项（交互）
  pnpm new:link                   添加友链（交互）
  pnpm new:home                   添加首页推荐（交互）`;

const commands = {
  post: {
    label: "文章",
    hint: "docs/posts/<slug>/index.md",
    run: createPost,
  },
  nav: {
    label: "导航项",
    hint: "data/nav.json",
    run: createNavLink,
  },
  link: {
    label: "友链",
    hint: "data/links.json",
    run: createFriendLink,
  },
  home: {
    label: "首页推荐",
    hint: "data/home.json",
    run: createRecommendation,
  },
};

const aliases = {
  posts: "post",
  navs: "nav",
  navigation: "nav",
  links: "link",
  friend: "link",
  recommendations: "home",
};

async function main() {
  const [rawCommand, ...args] = process.argv.slice(2);

  if (rawCommand === "help" || rawCommand === "--help" || rawCommand === "-h") {
    console.log(USAGE);
    return;
  }

  let command = rawCommand;
  if (!command) {
    if (!isInteractive()) {
      console.error(USAGE);
      process.exitCode = 1;
      return;
    }
    command = await select({
      message: "要创建什么？",
      options: Object.entries(commands).map(([value, { label, hint }]) => ({ label, hint, value })),
    });
  }

  const normalized = aliases[command] ?? command;
  const handler = commands[normalized];
  if (!handler) {
    console.error(`未知的创建类型：${command}`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  await handler.run(args);
}

main().catch((error) => {
  if (error instanceof PromptCancelledError) {
    process.exit(130);
  }
  console.error(`\x1b[31m${error.message}\x1b[0m`);
  process.exit(1);
});
