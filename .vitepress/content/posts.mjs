import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export const postsDirectory = fileURLToPath(new URL("../../docs/posts/", import.meta.url));
export const postsPattern = `${postsDirectory.replaceAll("\\", "/")}*/index.md`;

/**
 * Share the same metadata pipeline between the sidebar and the client content loader.
 * @returns {import('../theme/features/posts/types').Post[]}
 */
export function loadPosts() {
  return readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(`${postsDirectory}${entry.name}/index.md`))
    .map(({ name }) => {
      const file = `${postsDirectory}${name}/index.md`;
      const { data } = matter.read(file);
      const date = new Date(data.date);

      if (typeof data.title !== "string" || !data.title.trim() || !data.date || Number.isNaN(date.getTime())) {
        throw new Error(`${file}: title and a valid date are required`);
      }
      if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
        throw new Error(`${file}: tags must be an array of strings`);
      }

      return {
        url: `/posts/${name}`,
        title: data.title,
        date: date.toISOString().slice(0, 10),
        tags: [...new Set(data.tags)],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
}
