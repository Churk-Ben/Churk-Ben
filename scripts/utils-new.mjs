import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fail, root, show } from "./utils-cli.mjs";
import { isInteractive } from "./utils-prompt.mjs";

export { fail, root, show };

export const dataDirectory = join(root, "data");
export const dataFiles = {
  nav: join(dataDirectory, "nav.json"),
  links: join(dataDirectory, "links.json"),
  home: join(dataDirectory, "home.json"),
};

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function requireInteractive(name) {
  if (!isInteractive()) fail(`${name} 需要在交互式终端中运行`);
}

export function required(value) {
  return value.trim() ? undefined : "不能为空";
}

export function urlError(value) {
  if (!value) return "不能为空";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? undefined : "请使用 http(s) 链接";
  } catch {
    return "请输入完整 URL，例如 https://example.com";
  }
}
