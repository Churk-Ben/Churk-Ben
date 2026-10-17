import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkAssets } from "./check-assets.mjs";
import { checkPosts } from "./check-posts.mjs";
import { checkResources } from "./check-resources.mjs";
import { checkStyles } from "./check-styles.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const context = { root, docs: join(root, "docs"), theme: join(root, ".vitepress/theme") };

const checks = {
  assets: {
    description: "Markdown、主题源码与 data/ 中的图片引用",
    async run(ctx) {
      const { referenced, documents, sources } = await checkAssets(ctx);
      return {
        referenced,
        summary: `assets ok (${documents.length} Markdown, ${sources.length} sources)`,
      };
    },
  },
  resources: {
    description: "未引用或内容重复的本地资源",
    requires: ["assets"],
    run(ctx, results) {
      const count = checkResources({ ...ctx, referenced: results.assets.referenced });
      return { summary: `resources ok (${count} files)` };
    },
  },
  styles: {
    description: "Vue 组件中的内联样式",
    run(ctx) {
      return { summary: `styles ok (${checkStyles(ctx)} Vue components)` };
    },
  },
  posts: {
    description: "文章元数据、URL 唯一性与 slug",
    run() {
      return { summary: `posts ok (${checkPosts()} articles)` };
    },
  },
};

const NAMES = Object.keys(checks);
const USAGE = `用法：
  pnpm check                 运行全部检查
  pnpm check <name...>       只运行指定检查
  pnpm check --help          显示这段帮助

可用检查：
${NAMES.map((name) => `  ${name.padEnd(10)} ${checks[name].description}`).join("\n")}`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }

  const flags = args.filter((name) => name.startsWith("-"));
  if (flags.length) {
    console.error(`未知参数：${flags.join(", ")}`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  const requested = [...new Set(args.length ? args : NAMES)];
  const unknown = requested.filter((name) => !checks[name]);
  if (unknown.length) {
    console.error(`Unknown check(s): ${unknown.join(", ")}. Available: ${NAMES.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const results = {};
  for (const name of requested) {
    const check = checks[name];
    for (const dependency of check.requires ?? []) {
      results[dependency] ??= await checks[dependency].run(context, results);
    }
    results[name] = await check.run(context, results);
  }

  console.log(`Content checks passed: ${requested.map((name) => results[name].summary).join("; ")}`);
}

main().catch((error) => {
  console.error(`\x1b[31m${error.message}\x1b[0m`);
  process.exit(1);
});
