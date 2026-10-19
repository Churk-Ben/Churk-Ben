import { stdin, stdout } from "node:process";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";

/** 用户按下 Ctrl+C 取消交互。 */
export class PromptCancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "PromptCancelledError";
  }
}

export function isInteractive() {
  return Boolean(stdin.isTTY && stdout.isTTY);
}

function assertInteractive() {
  if (!isInteractive()) {
    throw new Error("当前环境不是交互式终端，请改用带参数的命令");
  }
}

/** 读取一行文本，带默认值与同步校验。 */
export async function input({ message, initial = "", hint, validate }) {
  assertInteractive();
  if (hint) stdout.write(`\x1b[90m${hint}\x1b[0m\n`);

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const suffix = initial ? ` \x1b[90m(${initial})\x1b[0m` : "";
      const answer = (await rl.question(`${message}${suffix}: `)).trim();
      const value = answer || initial;
      const error = validate?.(value);
      if (!error) return value;
      stdout.write(`\x1b[31m${error}\x1b[0m\n`);
    }
  } finally {
    rl.close();
  }
}

/** 方向键选择列表，Enter 确认；支持数字键快速定位。 */
export async function select({ message, options, initial = 0 }) {
  assertInteractive();
  if (!options.length) throw new Error("select() 至少需要一个选项");

  let cursor = Math.min(Math.max(initial, 0), options.length - 1);
  let rendered = 0;

  return new Promise((resolve, reject) => {
    const render = () => {
      if (rendered) stdout.write(`\x1b[${rendered}A`);
      const lines = [
        `${message} \x1b[90m(↑/↓ 选择，Enter 确认)\x1b[0m`,
        ...options.map((option, index) => {
          const active = index === cursor;
          const prefix = active ? "\x1b[36m❯\x1b[0m" : " ";
          const label = active ? `\x1b[1m${option.label}\x1b[0m` : option.label;
          const hint = option.hint ? ` \x1b[90m${option.hint}\x1b[0m` : "";
          return `${prefix} ${label}${hint}`;
        }),
      ];
      for (const line of lines) stdout.write(`\x1b[2K${line}\n`);
      rendered = lines.length;
    };

    const cleanup = () => {
      stdin.off("keypress", onKeypress);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\x1b[?25h");
    };

    const finish = (value) => {
      cleanup();
      stdout.write(`\x1b[${rendered}A`);
      for (let index = 0; index < rendered; index += 1) stdout.write("\x1b[2K\n");
      stdout.write(`\x1b[${rendered}A`);
      stdout.write(`\x1b[2K${message} \x1b[36m${options[cursor].label}\x1b[0m\n`);
      resolve(value);
    };

    const cancel = () => {
      cleanup();
      stdout.write(`\x1b[${rendered}A`);
      for (let index = 0; index < rendered; index += 1) stdout.write("\x1b[2K\n");
      stdout.write(`\x1b[${rendered}A`);
      reject(new PromptCancelledError());
    };

    const onKeypress = (character, key) => {
      if (key.ctrl && key.name === "c") return cancel();

      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + options.length) % options.length;
        return render();
      }
      if (key.name === "down" || key.name === "j") {
        cursor = (cursor + 1) % options.length;
        return render();
      }
      if (key.name === "return" || key.name === "enter") {
        return finish(options[cursor].value);
      }
      if (/^[1-9]$/.test(character) && Number(character) <= options.length) {
        cursor = Number(character) - 1;
        render();
      }
    };

    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKeypress);
    stdout.write("\x1b[?25l");
    render();
  });
}

/** 多选列表：方向键移动，空格勾选，a 全选/清空，Enter 确认，q 取消。 */
export async function multiSelect({ message, options, initial = [], windowSize = 12 }) {
  assertInteractive();
  if (!options.length) throw new Error("multiSelect() 至少需要一个选项");

  const selected = new Set(initial);
  const visible = Math.min(windowSize, options.length);
  let cursor = 0;
  let rendered = 0;

  return new Promise((resolve, reject) => {
    const render = () => {
      if (rendered) stdout.write(`\x1b[${rendered}A`);

      const start = Math.min(Math.max(cursor - Math.floor(visible / 2), 0), options.length - visible);
      const end = start + visible;
      const lines = [
        `${message} \x1b[90m(↑/↓ 移动，空格选择，a 全选，Enter 确认)\x1b[0m`,
        ...options.slice(start, end).map((option, offset) => {
          const index = start + offset;
          const active = index === cursor;
          const prefix = active ? "\x1b[36m❯\x1b[0m" : " ";
          const mark = selected.has(option.value) ? "\x1b[36m◉\x1b[0m" : "○";
          const label = active ? `\x1b[1m${option.label}\x1b[0m` : option.label;
          const hint = option.hint ? ` \x1b[90m${option.hint}\x1b[0m` : "";
          return `${prefix} ${mark} ${label}${hint}`;
        }),
        `\x1b[90m  已选 ${selected.size} 条${
          options.length > visible ? ` · ${start + 1}-${end} / ${options.length}` : ""
        }\x1b[0m`,
      ];

      for (const line of lines) stdout.write(`\x1b[2K${line}\n`);
      rendered = lines.length;
    };

    const cleanup = () => {
      stdin.off("keypress", onKeypress);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\x1b[?25h");
    };

    const clear = () => {
      stdout.write(`\x1b[${rendered}A`);
      for (let index = 0; index < rendered; index += 1) stdout.write("\x1b[2K\n");
      stdout.write(`\x1b[${rendered}A`);
    };

    const finish = (values) => {
      cleanup();
      clear();
      stdout.write(`\x1b[2K${message} \x1b[36m已选 ${values.length} 条\x1b[0m\n`);
      resolve(values);
    };

    const cancel = () => {
      cleanup();
      clear();
      reject(new PromptCancelledError());
    };

    const onKeypress = (character, key) => {
      if (key.ctrl && key.name === "c") return cancel();

      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + options.length) % options.length;
        return render();
      }
      if (key.name === "down" || key.name === "j") {
        cursor = (cursor + 1) % options.length;
        return render();
      }
      if (key.name === "space" || character === " ") {
        const value = options[cursor].value;
        if (selected.has(value)) selected.delete(value);
        else selected.add(value);
        return render();
      }
      if (character === "a" || character === "A") {
        if (selected.size === options.length) selected.clear();
        else for (const option of options) selected.add(option.value);
        return render();
      }
      if (key.name === "return" || key.name === "enter") return finish([...selected]);
      if (character === "q" || character === "Q") return finish([]);
      if (key.name === "escape") return cancel();
    };

    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKeypress);
    stdout.write("\x1b[?25l");
    render();
  });
}
