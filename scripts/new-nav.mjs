import { input, select } from "./prompt.mjs";
import { dataFiles, fail, readJson, requireInteractive, required, show, urlError, writeJson } from "./new-utils.mjs";

function optionalUrlError(value) {
  return value ? urlError(value) : undefined;
}

export async function createNavLink() {
  requireInteractive("pnpm new:nav");

  const groups = readJson(dataFiles.nav);
  const options = [
    ...groups.map((group, index) => ({
      label: group.title,
      hint: `${group.items.length} 项`,
      value: index,
    })),
    { label: "＋ 新建分组", hint: "先创建分类，再添加链接", value: "new" },
  ];
  const choice = await select({ message: "选择导航分组", options });

  let group;
  if (choice === "new") {
    const title = await input({
      message: "分组标题",
      validate: (value) =>
        required(value) ?? (groups.some((item) => item.title === value) ? "该分组已存在" : undefined),
    });
    group = { title, items: [] };
    groups.push(group);
  } else {
    group = groups[choice];
  }

  const title = await input({ message: "站点名称", validate: required });
  const link = await input({ message: "站点链接", validate: urlError });

  if (groups.some((item) => item.items.some((entry) => entry.link === link))) {
    fail(`该链接已存在：${link}`);
  }

  const desc = await input({ message: "一句话描述（可留空）", initial: "" });
  const icon = await input({
    message: "图标 URL（可留空，留空时显示首字母）",
    initial: "",
    validate: optionalUrlError,
  });
  const badge = await input({ message: "徽章文字（可留空）", initial: "" });

  group.items.push({
    ...(icon ? { icon } : {}),
    title,
    ...(desc ? { desc } : {}),
    link,
    ...(badge ? { badge } : {}),
  });

  writeJson(dataFiles.nav, groups);
  console.log(`Added "${title}" to ${show(dataFiles.nav)} (分组: ${group.title})`);
}
