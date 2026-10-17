# 维护博客

博客沿用 VitePress 默认主题。配色、顶栏与站点标识属于已有设计，日常维护优先复用主题变量与现有组件。

## 本地命令

使用 `.node-version` 声明的 Node.js 24 和 `package.json` 固定的 pnpm 12.11.2，在仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check                 # 全部校验，可传 assets / resources / styles / posts 跑子集
pnpm check:posts           # 也可用 pnpm check:assets / check:resources / check:styles
pnpm new-post <slug> "标题" # 按规范生成新文章骨架
pnpm format
pnpm format:check
pnpm typecheck             # vue-tsc 静态类型检查
pnpm build
pnpm preview
```

`pnpm check` 由 `scripts/check-content.mjs` 编排：`check-assets` 校验文章与主题源码引用的本地图片、`check-resources` 校验未引用或重复的资源、`check-styles` 校验 Vue 组件不使用内联样式、`check-posts` 校验文章元数据与 slug 命名。`pnpm typecheck` 依据根目录 `tsconfig.json` 用 `vue-tsc` 检查 `.vitepress/**` 的 TypeScript 与 Vue 组件。`pnpm build` 同时检查站内页面链接。CI 在构建前会执行 `pnpm check`、`pnpm format:check` 与 `pnpm typecheck`。

工具链使用 VitePress `2.0.0-alpha.20`、Vite 8、Vue 3、TypeScript 5.9、`vue-tsc` 和 Dart Sass Embedded。Vite 8 默认使用 Sass 现代编译器 API，无需再显式配置。VitePress 2 当前属于预发布版本，固定版本号以避免自动跳到其他 alpha；升级时同步调整阅读增强插件的兼容版本。数学插件固定在与 VitePress 内置 MarkdownIt 14 兼容的版本。

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
  public/shared/icon.png      # 多页共用：favicon、首页 hero、关于页
  public/links/               # 友链页头像
.env.example                  # 环境变量示例（复制为 .env.local 后填写）
.vitepress/
  config.mts                  # VitePress 入口、URL 映射与 env 加载
  configs/
    site.ts                   # 站点标识与文档页文案（数据）
    navbar.ts / sidebar.ts    # 顶栏与侧栏导航（数据）
    social.ts / footer.ts     # 社交链接与页脚文案（数据）
    integrations.ts           # 由环境变量解析访客徽章与评论配置
    head.ts / markdown.ts     # head 标签与 Markdown 渲染配置
    theme.ts                  # 组装 buildThemeConfig(env)
  content/posts.mjs           # 文章列表与内容校验共用的元数据读取逻辑
  theme/
    assets/icons.ts           # 跨配置与功能复用的内联 SVG 图标
    components/               # 全部 Vue 组件
      common/                 # 页面引言、访问徽章
      layout/                 # 布局、评论、页脚
      about/                  # 关于页内容
      home/                   # 首页文章区
      posts/                  # 归档、列表
      nav/                    # 导航分组与卡片
      links/                  # 友链展示
      sidebar/                # 侧栏扩展容器
    composables/              # 外观切换、图片放大、页面标识、最近使用记录
    features/                 # 各功能的数据与类型
      home/                   # 首页推荐阅读数据
      posts/                  # 归档筛选、Post 类型、VitePress 加载器 posts.data.ts
      nav/                    # 导航数据与类型
      links/                  # 友链数据
    custom.scss               # 全局 SCSS 入口
    styles/                   # 品牌色变量与少量功能性规则
scripts/
  check-content.mjs           # 校验编排入口（可传 assets/resources/styles/posts 子集）
  check-assets.mjs            # 文章与主题源码的图片引用校验
  check-resources.mjs         # 未引用 / 重复资源校验
  check-styles.mjs            # Vue 内联样式校验
  check-posts.mjs             # 文章元数据、URL 唯一性与 slug 校验
  fs-utils.mjs                # 递归列文件等公共工具
  new-post.mjs                # 新建文章脚手架
```

配置层为数据驱动：`configs/` 下的数据文件只存放站点标识、导航、社交、页脚等数据，`theme.ts` 的 `buildThemeConfig(env)` 把它们组装成主题配置，`config.mts` 通过 `loadEnv` 读取环境变量后传入。主题按类型分层：`components/` 存放全部 Vue 组件（`common`、`layout` 为通用组件，`home`、`posts`、`nav`、`links`、`sidebar` 按页面/功能分目录），`composables/` 存放组合式函数，`features/` 存放各功能的数据与类型（`data.ts`、`types.ts`，文章另有 VitePress 加载器 `posts.data.ts`），功能本地资源放在 `features/<name>/assets/`。相对导入保留 `.ts` 扩展名，`.vue`、`.mjs` 与资源文件保留原扩展名。

## 侧栏与顶栏

除首页外，所有页面显示同一套侧栏，配置在 `configs/sidebar.ts`：文章与导航都是可折叠列表，文章子项来自文章元数据，导航子项来自 `NAV_DATA` 分组标题对应的页面锚点；关于和友链保持单页入口。顶栏只保留主要内容入口，配置在 `configs/navbar.ts`。

需要新增侧栏挂件时，在 `theme/components/layout/MLayout.vue` 的 `#sidebar-nav-before` / `#sidebar-nav-after` 插槽中，把组件放进 `MSidebarWidgets` 容器即可，容器为空时自动隐藏。

## 公共资源与导航图标

`docs/public/` 按使用范围组织：多页共用的资源放 `shared/`，仅单页使用的资源放对应页面目录（如 `home/`、`about/`）。引用时使用绝对路径（如 `/shared/icon.png`），VitePress 会原样复制到产物。

导航站图标直接使用各站点的远程 URL，维护在 `theme/features/nav/data.ts`，不再随仓库保存本地副本。浏览器与 CDN 会按响应头缓存，避免重复下载；图标加载失败时 `MNavLink` 会回退为站点名称首字母。

## 环境变量

需要配置集成（访问徽章、Giscus 评论）时，复制 `.env.example` 为 `.env.local` 并填写；`.env.local` 已被 `.gitignore` 忽略。变量在构建时由 `config.mts` 的 `loadEnv` 读取，经 `configs/integrations.ts` 解析进主题配置，未填写时对应组件不渲染：

- `VISITOR_BADGE_ID`：访问统计徽章，填入即启用。
- `GISCUS_REPO`、`GISCUS_REPO_ID`、`GISCUS_CATEGORY`、`GISCUS_CATEGORY_ID`：四项齐全才启用评论。

这些值会写入站点产物，属于公开信息，不要放置密钥。CI 构建同样通过环境变量注入，仓库不保存真实值。

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

新增稿件会进入首页与归档；侧栏在启动或构建时读取同一套元数据，开发时新增文章或修改侧栏标题后重启开发服务器。阅读入口和归档筛选标签统一维护在 `theme/features/posts/data.ts`，`Post` 类型在 `theme/features/posts/types.ts`。也可用 `pnpm new-post <slug> "标题"` 生成骨架。

## 组件与样式

Markdown 负责内容，主题负责展示。页面可以直接使用已注册的 `MPageIntro`、`MAbout`、`MHomeContent`、`MPostArchive`、`MNav`、`MLinks`，无需导入主题内部路径。

组件自身样式统一放在 `<style lang="scss" scoped>`，只保留布局、间距、边框与颜色；字号、行高、字重等排版交给 VitePress 默认值。`theme/styles/` 只放品牌色变量（`_tokens.scss`）与少量功能性规则（`_base.scss`，如 katex 横向滚动、medium-zoom、焦点轮廓），由 `custom.scss` 使用 Sass 的 `@use` 加载，不使用已弃用的 Sass `@import`。颜色继续引用 VitePress 的 CSS 自定义属性，以支持明暗主题切换；第三方依赖的 CSS 直接导入，不复制或改写。Vite 通过 `sass-embedded` 的现代编译器 API 编译 SCSS。

不要使用 `style="..."`、`:style` 或通过 DOM 的 `.style` 修改布局；图片失败和条件显示使用 Vue 状态与 `v-if`。外观切换的圆形过渡通过 Web Animations API 实现，保留系统的减少动态效果设置。

全仓 Prettier 使用 `.prettierrc` 中的 `printWidth: 120`，其余选项沿用默认值。`pnpm format` 执行格式化，`pnpm format:check` 只检查；依赖和构建缓存由 `.prettierignore` 排除。Markdown 中的 C / C++ 代码样例仍属于文章内容，格式化器不会编译或修正它们。
