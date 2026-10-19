import { createFriendLink } from "./new-link.mjs";
import { createNavLink } from "./new-nav.mjs";
import { createPost } from "./new-post.mjs";
import { createRecommendation } from "./new-home.mjs";
import { dispatch, runMain } from "./utils-cli.mjs";

const USAGE = `用法：
  pnpm new                        交互选择要创建的内容
  pnpm new:post [slug] ["标题"] [--private]
                                  新建文章；--private 写入 private/posts
  pnpm new:private [slug] ["标题"]
                                  新建隐私文章
  pnpm new:nav                    添加导航项（交互）
  pnpm new:link                   添加友链（交互）
  pnpm new:home                   添加首页推荐（交互）
  pnpm new --help                 显示这段帮助`;

const commands = {
  post: {
    label: "文章",
    hint: "docs/posts/<slug>/index.md",
    run: (args) => createPost(args),
  },
  private: {
    label: "隐私文章",
    hint: "private/posts/<slug>/index.md",
    run: (args) => createPost(args, { private: true }),
  },
  nav: {
    label: "导航项",
    hint: "data/nav.json",
    run: createNavLink,
  },
  link: {
    label: "友链",
    hint: "data/links.json",
    run: createFriendLink,
  },
  home: {
    label: "首页推荐",
    hint: "data/home.json",
    run: createRecommendation,
  },
};

const aliases = {
  posts: "post",
  navs: "nav",
  navigation: "nav",
  links: "link",
  friend: "link",
  recommendations: "home",
};

runMain(() =>
  dispatch({
    usage: USAGE,
    commands,
    aliases,
    selectMessage: "要创建什么？",
    allowArgs: true,
  }),
);
