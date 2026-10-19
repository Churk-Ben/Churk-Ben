import { exportMiNotes } from "./export-mi-notes.mjs";
import { dispatch, runMain } from "./utils-cli.mjs";

const USAGE = `用法：
  pnpm export                     交互选择要导出的内容
  pnpm export:mi-notes [选项]     从小米云便签导出 Markdown
  pnpm export --help              显示这段帮助

运行 pnpm export:mi-notes --help 查看便签导出的完整选项。`;

const commands = {
  "mi-notes": {
    label: "小米云便签",
    hint: "i.mi.com → Markdown",
    run: exportMiNotes,
  },
};

const aliases = {
  notes: "mi-notes",
};

runMain(() =>
  dispatch({
    usage: USAGE,
    commands,
    aliases,
    selectMessage: "要导出什么？",
    allowArgs: true,
    commandHandlesHelp: true,
  }),
);
