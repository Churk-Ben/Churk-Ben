import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { filesIn } from "./utils-fs.mjs";

/** 禁用内联样式，要求 Vue 组件使用类名与 Vue 状态。 */
export function checkStyles({ root, theme }) {
  const components = filesIn(theme).filter((file) => file.endsWith(".vue"));

  for (const file of components) {
    const source = readFileSync(file, "utf8");
    assert(
      !/\s(?::?style)\s*=|\bonerror\s*=|\.style\./.test(source),
      `${relative(root, file)}: use classes and Vue state instead of inline styles`,
    );
  }

  return components.length;
}
