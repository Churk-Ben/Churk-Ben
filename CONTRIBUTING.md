# 维护博客

博客沿用 VitePress 默认主题。配色、顶栏与站点标识属于已有设计，日常维护优先复用主题变量与现有组件。

## 本地命令

使用 Node.js 24 和项目声明的 pnpm 版本，在仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm format
pnpm format:check
pnpm build
pnpm preview
```

`pnpm check` 检查文章元数据、本地图片引用、重复或未引用的资源，以及 Vue 组件中的内联样式。`pnpm build` 同时检查站内页面链接。

## 目录职责

```text
docs/
  index.md, about.md, nav.md, links.md
  posts/
    index.md                  # 文章归档页
    <slug>/
      index.md                # 单篇稿件
      images/                 # 该稿件专用的截图
  drafts/                     # 可选草稿目录，不参与站点构建
  public/img/icon.png         # 需固定 URL 的公共站点头像与 favicon
.vitepress/
  config.mts                  # VitePress 入口与 URL 映射
  configs/                    # 实际使用的 head、Markdown、主题配置
  content/posts.mjs           # 侧栏与文章列表共用的元数据读取逻辑
  theme/
    components/common/        # 页面引言、访问徽章等共用组件
    components/layout/        # 布局、评论、页脚
    composables/              # 外观切换、图片放大、页面标识
    features/posts/           # 首页文章区、归档、列表、阅读入口与类型
    features/navigation/      # 导航数据、卡片、最近使用记录
    features/friends/         # 友链数据、组件与专属头像
    styles/                   # 主题变量、全局规则、首页与个人页样式
scripts/check-content.mjs    # 内容与资源一致性检查
```

`configs/sidebar.ts` 是工作区原有的独立配置草稿，保留已有内容，当前入口未使用它；生效的侧栏由 `configs/theme.ts` 读取文章元数据生成。

## 新增文章

创建 `docs/posts/<slug>/index.md`，其中 `<slug>` 使用稳定的英文短横线名称：

```md
---
title: 文章标题
date: 2026-10-15
tags: [学习笔记, C语言]
---

# 文章标题

正文。

![运行结果](./images/result.png)
```

文章仍通过 `/posts/<slug>` 访问。`config.mts` 将目录中的 `index.md` 映射到原来的页面路径，因此移动源码不会改变已发布的文章链接。已有稿件的正文与代码示例保持原样。

图片放进同一稿件的 `images/`，使用相对路径。Vite 负责生成带内容哈希的产物，避免源码图片又被 `public` 整目录复制一遍。多个页面共用且必须保持固定 URL 的资源才放进 `docs/public/`；组件专用资源随功能目录保存，并通过 `import` 引入。

新增稿件会进入首页与归档；侧栏在启动或构建时读取同一套元数据，开发时新增文章或修改侧栏标题后重启开发服务器。阅读入口和归档筛选标签统一维护在 `theme/features/posts/posts.ts`。

## 组件与样式

Markdown 负责内容，主题负责展示。页面可以直接使用已注册的 `MPageIntro`、`MHomeContent`、`MPostArchive`、`MNav`、`MFriendLinks`，无需导入主题内部路径。

组件自身样式放在 `<style scoped>`；跨组件规则放在 `theme/styles/`，颜色统一引用 VitePress 变量。不要使用 `style="..."`、`:style` 或通过 DOM 的 `.style` 修改布局；图片失败和条件显示使用 Vue 状态与 `v-if`。外观切换的圆形过渡通过 Web Animations API 实现，保留系统的减少动态效果设置。

全仓 Prettier 使用 `.prettierrc` 中的 `printWidth: 120`，其余选项沿用默认值。`pnpm format` 执行格式化，`pnpm format:check` 只检查；依赖和构建缓存由 `.prettierignore` 排除。Markdown 中的 C / C++ 代码样例仍属于文章内容，格式化器不会编译或修正它们。
