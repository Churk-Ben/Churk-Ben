import { readdirSync } from "node:fs";
import { join } from "node:path";

/** 递归列出目录下的全部文件。 */
export function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}
