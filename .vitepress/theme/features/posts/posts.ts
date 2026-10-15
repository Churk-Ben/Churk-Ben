export interface Post {
  url: string;
  title: string;
  date: string;
  tags: string[];
}

export const postFilters = ["全部", "学习笔记", "OJ题解", "教程", "算法"];

export const readingPaths = [
  { title: "C 语言学习笔记", desc: "从基础语法到文件读写，记录学习的每一步。", url: "/posts/c-study-notes-1" },
  { title: "LevOJ 题解", desc: "在一道道题目中，整理思路与实现。", url: "/posts/levoj-1" },
  { title: "搭建开发环境", desc: "从 VSCode 开始，配置 C / C++ 开发环境。", url: "/posts/vscode-cpp-setup" },
];

export function groupPostsByYear(posts: Post[]) {
  const years = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const group = years.get(year) ?? [];
    group.push(post);
    years.set(year, group);
  }
  return [...years].map(([year, posts]) => ({ year, posts }));
}
