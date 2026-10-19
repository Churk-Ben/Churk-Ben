import { join } from "node:path";
import { checkAssets } from "./check-assets.mjs";
import { checkPosts } from "./check-posts.mjs";
import { checkResources } from "./check-resources.mjs";
import { checkStyles } from "./check-styles.mjs";
import { isHelp, root, runMain, usageError } from "./utils-cli.mjs";

const context = { root, docs: join(root, "docs"), theme: join(root, ".vitepress/theme") };

const checks = {
  assets: {
    description: "Markdown、主题源码与 data/ 中的图片引用",
    async run(ctx) {
      const { referenced, documents, sources } = await checkAssets(ctx);
      return {
        referenced,
        summary: `assets（${documents.length} 篇 Markdown，${sources.length} 个源码文件）`,
      };
    },
  },
  resources: {
    description: "未引用或内容重复的本地资源",
    requires: ["assets"],
    run(ctx, results) {
      const count = checkResources({ ...ctx, referenced: results.assets.referenced });
      return { summary: `resources（${count} 个文件）` };
    },
  },
  styles: {
    description: "Vue 组件中的内联样式",
    run(ctx) {
      return { summary: `styles（${checkStyles(ctx)} 个 Vue 组件）` };
    },
  },
  posts: {
    description: "文章元数据、URL 唯一性与 slug",
    run() {
      return { summary: `posts（${checkPosts()} 篇文章）` };
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

  if (isHelp(args[0])) {
    console.log(USAGE);
    return;
  }

  const flags = args.filter((name) => name.startsWith("-"));
  if (flags.length) {
    usageError(`未知参数：${flags.join(", ")}`, USAGE);
    return;
  }

  const requested = [...new Set(args.length ? args : NAMES)];
  const unknown = requested.filter((name) => !checks[name]);
  if (unknown.length) {
    usageError(`未知检查：${unknown.join(", ")}。可用检查：${NAMES.join(", ")}`, USAGE);
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

  console.log(`检查通过：${requested.map((name) => results[name].summary).join("；")}`);
}

runMain(main);
