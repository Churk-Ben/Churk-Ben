import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { extname, relative } from "node:path";
import { filesIn } from "./fs-utils.mjs";

const RESOURCE_PATTERN = /\.(png|jpe?g|svg|gif|webp|avif|ico)$/;

/** 确保每个资源都被引用，且没有内容重复的副本。 */
export function checkResources({ root, docs, theme, referenced }) {
  const resources = [...filesIn(docs), ...filesIn(theme)].filter((file) => RESOURCE_PATTERN.test(extname(file)));

  const hashes = new Map();
  for (const file of resources) {
    assert(referenced.has(file), `Unreferenced resource: ${relative(root, file)}`);
    const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
    assert(!hashes.has(hash), `Duplicate resource: ${relative(root, file)} and ${hashes.get(hash)}`);
    hashes.set(hash, relative(root, file));
  }

  return resources.length;
}
