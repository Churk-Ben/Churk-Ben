import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkAssets } from "./check-assets.mjs";
import { checkPosts } from "./check-posts.mjs";
import { checkResources } from "./check-resources.mjs";
import { checkStyles } from "./check-styles.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const context = { root, docs: join(root, "docs"), theme: join(root, ".vitepress/theme") };

const known = ["assets", "resources", "styles", "posts"];
const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !known.includes(name));

if (unknown.length) {
  console.error(`Unknown check(s): ${unknown.join(", ")}. Available: ${known.join(", ")}`);
  process.exit(1);
}

const runs = (name) => requested.length === 0 || requested.includes(name);
const summary = [];

// resources 依赖 assets 产出的引用集合，因此单独跑 resources 时也先收集引用。
if (runs("assets") || runs("resources")) {
  const { referenced, documents, sources } = await checkAssets(context);
  if (runs("assets")) summary.push(`assets ok (${documents.length} Markdown, ${sources.length} sources)`);
  if (runs("resources")) summary.push(`resources ok (${checkResources({ ...context, referenced })} files)`);
}

if (runs("styles")) summary.push(`styles ok (${checkStyles(context)} Vue components)`);
if (runs("posts")) summary.push(`posts ok (${checkPosts()} articles)`);

console.log(`Content checks passed: ${summary.join("; ")}`);
