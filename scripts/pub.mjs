import { execFileSync } from "node:child_process";
import { optimizeImages } from "./optimize.mjs";
import { fail, isHelp, root, runMain, usageError } from "./utils-cli.mjs";

const CONTENT_PATHS = ["docs", "data"];

const USAGE = `用法：
  pnpm pub [提交说明] [--no-push] [--no-optimize]
  pnpm pub --help

只提交 docs/ 与 data/ 下的内容改动，然后推送到当前分支的上游。
发布前会自动把超过 300 KB 的内容图片转为 WebP，原图保留为 .raw.<ext>。
暂存区里存在代码改动时会中止，未暂存的代码改动不会进入本次提交。`;

function git(args, { inherit = false } = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });
}

function lines(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isContent(path) {
  return CONTENT_PATHS.some((directory) => path === directory || path.startsWith(`${directory}/`));
}

function hasUpstream() {
  try {
    git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.some(isHelp)) {
    console.log(USAGE);
    return;
  }

  const flags = args.filter((argument) => argument.startsWith("-"));
  const unknown = flags.filter((flag) => !["--no-push", "--no-optimize"].includes(flag));
  if (unknown.length) {
    usageError(`未知参数：${unknown.join(", ")}`, USAGE);
    return;
  }

  const noPush = flags.includes("--no-push");
  const noOptimize = flags.includes("--no-optimize");
  const message =
    args
      .filter((argument) => !argument.startsWith("-"))
      .join(" ")
      .trim() || `content: publish ${new Date().toISOString().slice(0, 10)}`;

  const stagedCode = lines(git(["diff", "--cached", "--name-only"])).filter((path) => !isContent(path));
  if (stagedCode.length) {
    fail(
      [
        "暂存区里有代码改动，已停止发布：",
        ...stagedCode.map((file) => `  ${file}`),
        "请先提交或取消暂存，再运行 pnpm pub。",
      ].join("\n"),
    );
  }

  if (!noOptimize) await optimizeImages();

  git(["add", "-A", "--", ...CONTENT_PATHS]);
  const stagedContent = lines(git(["diff", "--cached", "--name-only"]));
  if (!stagedContent.length) {
    console.log("没有需要发布的内容改动。");
    return;
  }

  git(["commit", "-m", message]);
  const hash = git(["rev-parse", "--short", "HEAD"]).trim();
  console.log(`已提交 ${hash}：${message}`);
  console.log(`包含 ${stagedContent.length} 个内容文件（${CONTENT_PATHS.join("、")}）。`);

  if (noPush) {
    console.log("已跳过推送（--no-push）。");
  } else {
    if (hasUpstream()) {
      git(["push"], { inherit: true });
    } else {
      const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
      git(["push", "-u", "origin", branch], { inherit: true });
    }
    console.log("已推送到 origin。");
  }

  const remaining = lines(git(["status", "--porcelain"]));
  if (remaining.length) {
    console.log("以下改动未包含在本次发布中：");
    for (const line of remaining) console.log(`  ${line}`);
  }
}

runMain(main);
