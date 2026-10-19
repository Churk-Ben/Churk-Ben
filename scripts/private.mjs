import { build } from "./private-build.mjs";
import { clean } from "./private-clean.mjs";
import { dispatch, runMain } from "./utils-cli.mjs";

const USAGE = `用法：
  pnpm private                 加密并清理隐私文章（同 pnpm private:build）
  pnpm private:build           加密 private/posts，未变化的文章复用旧密文并清理失效生成物
  pnpm private:clean           只清理已从 private/posts 删除的文章生成物
  pnpm private --help          显示这段帮助`;

const commands = {
  build: {
    label: "构建",
    hint: "加密 private/posts 并清理失效生成物",
    run: build,
  },
  clean: {
    label: "清理",
    hint: "只清理已删除文章的生成物",
    run: clean,
  },
};

runMain(() =>
  dispatch({
    usage: USAGE,
    commands,
    defaultCommand: "build",
  }),
);
