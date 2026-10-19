import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isInteractive, PromptCancelledError, select } from "./utils-prompt.mjs";

export const root = fileURLToPath(new URL("../", import.meta.url));

/** 相对仓库根目录的展示路径；目录外路径保持原样。 */
export function show(file) {
  const path = relative(root, file);
  return (path && !path.startsWith("..") ? path : file).replaceAll("\\", "/");
}

export function fail(message) {
  throw new Error(message);
}

export function isHelp(value) {
  return value === "help" || value === "--help" || value === "-h";
}

/** 打印错误与用法，并以非零退出码结束当前命令。 */
export function usageError(message, usage) {
  if (message) console.error(`\x1b[31m${message}\x1b[0m`);
  console.error(usage);
  process.exitCode = 1;
}

/**
 * 统一的分发器：处理帮助、别名、交互式选择和未知命令。
 * handler.run(args) 负责具体逻辑；allowArgs 为 false 时拒绝多余参数。
 */
export async function dispatch({
  usage,
  commands,
  aliases = {},
  defaultCommand,
  selectMessage = "请选择要执行的命令",
  allowArgs = false,
  commandHandlesHelp = false,
}) {
  const [rawCommand, ...args] = process.argv.slice(2);

  if (isHelp(rawCommand) || (!commandHandlesHelp && args.some(isHelp))) {
    console.log(usage);
    return;
  }

  let command = rawCommand;
  if (!command) {
    if (defaultCommand) {
      command = defaultCommand;
    } else if (isInteractive()) {
      command = await select({
        message: selectMessage,
        options: Object.entries(commands)
          .filter(([, { hidden }]) => !hidden)
          .map(([value, { label, hint }]) => ({ label, hint, value })),
      });
    } else {
      usageError(null, usage);
      return;
    }
  }

  const normalized = aliases[command] ?? command;
  const handler = commands[normalized];
  if (!handler) {
    usageError(`未知命令：${command}`, usage);
    return;
  }

  if (!allowArgs && args.length) {
    usageError(`未知参数：${args.join(", ")}`, usage);
    return;
  }

  await handler.run(args);
}

/** 统一入口错误处理：Ctrl+C 退出 130，其余错误红字并返回 1。 */
export function runMain(main) {
  main().catch((error) => {
    if (error instanceof PromptCancelledError) {
      process.exitCode = 130;
      return;
    }

    console.error(`\x1b[31m${error.stderr?.toString().trim() || error.message}\x1b[0m`);
    process.exitCode = 1;
  });
}
