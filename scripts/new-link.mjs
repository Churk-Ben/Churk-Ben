import { existsSync } from "node:fs";
import { join } from "node:path";
import { input, select } from "./prompt.mjs";
import {
  dataFiles,
  fail,
  readJson,
  requireInteractive,
  required,
  root,
  show,
  urlError,
  writeJson,
} from "./new-utils.mjs";

const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i;
const LINK_ICON_OPTIONS = [
  { label: "GitHub", value: "github" },
  { label: "哔哩哔哩", value: "bilibili" },
  { label: "知乎", value: "zhihu" },
  { label: "QQ", value: "qq" },
  { label: "微信", value: "weixin" },
  { label: "微博", value: "weibo" },
  { label: "X / Twitter", value: "x" },
  { label: "YouTube", value: "youtube" },
  { label: "Discord", value: "discord" },
  { label: "Telegram", value: "telegram" },
  { label: "Gitee", value: "gitee" },
  { label: "Steam", value: "steam" },
  { label: "Mastodon", value: "mastodon" },
  { label: "Reddit", value: "reddit" },
  { label: "网站", value: "website" },
  { label: "RSS", value: "rss" },
  { label: "邮箱", value: "mail" },
  { label: "博客", value: "blog" },
  { label: "文档", value: "book" },
  { label: "代码", value: "code" },
  { label: "通用链接", value: "link" },
];

function avatarError(value) {
  if (!value) return "不能为空";
  if (/^https?:\/\//i.test(value)) return undefined;
  if (!value.startsWith("/")) return "本地头像请使用 / 开头的 docs/public 路径，例如 /links/name.png";
  if (!IMAGE_PATTERN.test(value)) return "请使用图片文件";
  if (!existsSync(join(root, "docs/public", value))) return `文件不存在：docs/public${value}`;
  return undefined;
}

function allLinks(friends) {
  return new Set(friends.flatMap((friend) => friend.links.map((link) => link.url)));
}

/** 连续收集多个入口链接，默认在第一个之后询问是否继续。 */
async function collectLinks(existingUrls) {
  const urls = new Set(existingUrls);
  const items = [];
  let first = true;

  while (true) {
    if (!first) {
      const again = await select({
        message: "还要添加其他链接吗？",
        options: [
          { label: "继续添加", value: true },
          { label: "完成", value: false },
        ],
        initial: 1,
      });
      if (!again) break;
    }

    const url = await input({
      message: first ? "链接 URL" : "下一个链接 URL",
      validate: (value) => {
        const error = urlError(value);
        if (error) return error;
        return urls.has(value) ? "该链接已存在" : undefined;
      },
    });
    urls.add(url);

    const icon = await select({ message: "图标", options: LINK_ICON_OPTIONS });
    items.push({ icon, url });
    first = false;
  }

  return items;
}

export async function createFriendLink() {
  requireInteractive("pnpm new:link");

  const friends = readJson(dataFiles.links);
  const mode = await select({
    message: "友链操作",
    options: [
      { label: "新建友链", value: "create" },
      { label: "给已有友链追加链接", value: "append", hint: `${friends.length} 个友链` },
    ],
  });

  if (mode === "append") {
    if (!friends.length) fail("还没有友链，请先新建一条");

    const index = await select({
      message: "选择友链",
      options: friends.map((friend, friendIndex) => ({
        label: friend.name,
        hint: friend.links.map((link) => link.url).join(" · "),
        value: friendIndex,
      })),
    });
    const friend = friends[index];
    const added = await collectLinks(allLinks(friends));

    friend.links.push(...added);
    writeJson(dataFiles.links, friends);
    console.log(`Added ${added.length} link(s) to "${friend.name}" in ${show(dataFiles.links)}`);
    return;
  }

  const name = await input({
    message: "站点名称",
    validate: (value) =>
      required(value) ??
      (friends.some((friend) => friend.name === value) ? "同名友链已存在，可选择追加链接" : undefined),
  });
  const avatar = await input({
    message: "头像路径",
    hint: "本地头像先放进 docs/public/links/，再填写 /links/xxx.png；也可填远程 URL",
    validate: avatarError,
  });
  const links = await collectLinks(allLinks(friends));

  friends.push({ avatar, name, links });
  writeJson(dataFiles.links, friends);
  console.log(`Added "${name}" to ${show(dataFiles.links)} (${links.length} links)`);
}
