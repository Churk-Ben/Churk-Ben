import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const CONTENT_PATHS = ["docs", "data"];

const USAGE = `用法：
  pnpm pub [提交说明] [--no-push]

只提交 docs/ 与 data/ 下的内容改动，然后推送到当前分支的上游。
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

function fail(message) {
  console.error(`\x1b[31m${message}\x1b[0m`);
  process.exit(1);
}

function hasUpstream() {
  try {
    git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }

  const noPush = args.includes("--no-push");
  const message =
    args
      .filter((argument) => !argument.startsWith("-"))
      .join(" ")
      .trim() || `content: publish ${new Date().toISOString().slice(0, 10)}`;

  const stagedCode = lines(git(["diff", "--cached", "--name-only"])).filter((path) => !isContent(path));
  if (stagedCode.length) {
    console.error("暂存区里有代码改动，已停止发布：");
    for (const file of stagedCode) console.error(`  ${file}`);
    console.error("请先提交或取消暂存，再运行 pnpm pub。");
    process.exitCode = 1;
    return;
  }

  git(["add", "-A", "--", ...CONTENT_PATHS]);
  const stagedContent = lines(git(["diff", "--cached", "--name-only"]));
  if (!stagedContent.length) {
    console.log("没有需要发布的内容改动。");
    return;
  }

  git(["commit", "-m", message]);
  const hash = git(["rev-parse", "--short", "HEAD"]).trim();
  console.log(`Committed ${hash}: ${message}`);
  console.log(`Included ${stagedContent.length} content file(s) from ${CONTENT_PATHS.join(", ")}.`);

  if (noPush) {
    console.log("Skipped push (--no-push).");
  } else {
    if (hasUpstream()) {
      git(["push"], { inherit: true });
    } else {
      const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
      git(["push", "-u", "origin", branch], { inherit: true });
    }
    console.log("Pushed to origin.");
  }

  const remaining = lines(git(["status", "--porcelain"]));
  if (remaining.length) {
    console.log("以下改动未包含在本次发布中：");
    for (const line of remaining) console.log(`  ${line}`);
  }
}

try {
  main();
} catch (error) {
  const detail = error.stderr?.toString().trim() || error.message;
  fail(detail);
}
