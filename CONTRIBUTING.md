# 维护博客

博客沿用 VitePress 默认主题。配色、顶栏与站点标识属于已有设计，日常维护优先复用主题变量与现有组件。

## 本地命令

使用 `.node-version` 声明的 Node.js 24 和 `package.json` 固定的 pnpm 12.11.2，在仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check                 # 全部内容校验
pnpm check assets posts    # 只跑指定子集（assets / resources / styles / posts）
pnpm check:posts           # 单项快捷命令，也可用 check:assets / check:resources / check:styles
pnpm new                   # 交互选择要创建的内容
pnpm new:post [slug] ["标题"] [--private] # 新建文章；--private 写入 private/posts
pnpm new:private [slug] ["标题"]          # 新建隐私文章骨架
pnpm new:nav               # 添加导航项，可选择已有分组或新建分组
pnpm new:link              # 添加友链，或给已有友链追加链接
pnpm new:home              # 添加首页推荐阅读
pnpm private               # 加密 private/posts 下的隐私文章，生成公开入口与密文
pnpm mi:notes              # 从小米云便签导出 Markdown（需 private/mi-cookie.txt）
pnpm pub [说明]           # 只提交并推送 docs/ 与 data/ 的内容改动
pnpm optimize              # 手动把内容里超过 300 KB 的图片转为 WebP（pub 会自动执行）
pnpm format
pnpm format:check
pnpm typecheck             # vue-tsc 静态类型检查
pnpm build
pnpm preview
```

`pnpm check` 由 `scripts/check.mjs` 编排：`check-assets` 校验文章、主题源码与 `data/` 数据里引用的本地图片，`check-resources` 校验未引用或重复的资源，`check-styles` 校验 Vue 组件不使用内联样式，`check-posts` 校验文章元数据与 slug 命名。`resources` 依赖 `assets` 收集的引用集合，单独运行时入口会自动先执行 `assets`。`pnpm typecheck` 依据根目录 `tsconfig.json` 用 `vue-tsc` 检查 `.vitepress/**` 的 TypeScript 与 Vue 组件。`pnpm build` 同时检查站内页面链接。CI 在构建前会执行 `pnpm check`、`pnpm format:check` 与 `pnpm typecheck`。

`pnpm new` 由 `scripts/new.mjs` 统一分发，具体创建逻辑按类型拆在 `new-post.mjs`、`new-nav.mjs`、`new-link.mjs`、`new-home.mjs`，共用路径、JSON 读写与校验放在 `new-utils.mjs`，交互逻辑在 `prompt.mjs`。交互命令需要终端；`pnpm new:post <slug> "标题"` 在传齐参数时不会询问，可直接用于脚本。`pnpm new:post <slug> "标题" --private` 和 `pnpm new:private <slug> "标题"` 会把源写到 `private/posts/`。

`pnpm pub` 由 `scripts/pub.mjs` 提供：只把 `docs/` 与 `data/` 下的内容改动加入暂存区，提交后推送当前分支；暂存区已有代码改动时会中止，未暂存的代码改动不会进入本次提交。发布前会自动执行图片优化，可用 `--no-optimize` 跳过；`--no-push` 只提交不推送。`pnpm publish` 是 pnpm 自带的 registry 发布命令，所以博客内容发布使用更短的 `pnpm pub`。

`pnpm mi:notes` 由 `scripts/export-mi-notes.mjs` 提供：登录 i.mi.com 后把请求头里的 Cookie 存到 `private/mi-cookie.txt`（已被忽略）或环境变量 `MI_COOKIE`，脚本会分页拉取便签、转换成 Markdown 并下载图片。默认先列出便签（带分类）再交互选择；`--folders` 查看分类及数量，`--folder <名称>` 只看某个分类，`--all`、`--limit <数量>`、`--search <关键词>` 可用于非交互筛选。输出默认在 `import/notes/`（已被忽略），每篇一个目录，包含 `index.md` 与 `images/`；用 `--out private/posts` 可直接写入隐私文章源目录，再运行 `pnpm private` 加密。

工具链使用 VitePress `2.0.0-alpha.20`、Vite 8、Vue 3、TypeScript 5.9、`vue-tsc` 和 Dart Sass Embedded。Vite 8 默认使用 Sass 现代编译器 API，无需再显式配置。VitePress 2 当前属于预发布版本，固定版本号以避免自动跳到其他 alpha；升级时同步调整阅读增强插件的兼容版本。数学插件固定在与 VitePress 内置 MarkdownIt 14 兼容的版本。

## 目录职责

```text
data/                         # 构建时读取的站点数据，不复制到产物
  nav.json                    # 导航站分组与链接
  links.json                  # 友链名称、简介、头像与多个入口链接
  home.json                   # 首页推荐阅读
  posts.json                  # 归档筛选标签
docs/
  index.md, about.md, nav.md, links.md
  posts/
    index.md                  # 文章归档页
    <slug>/
      index.md                # 单篇稿件
      images/                 # 该稿件专用的截图
  private/
    index.md                  # 隐私文章归档页，解锁后展示
    <slug>/index.md           # pnpm private 生成的隐私文章入口
  drafts/                     # 可选草稿目录，不参与站点构建
  public/shared/icon.png      # 多页共用：favicon、首页 hero、关于页
  public/links/               # 友链页头像
  public/private/             # 隐私文章密文，可公开访问但无法直接阅读
private/posts/<slug>/         # 隐私文章明文源，已被 .gitignore 忽略
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
  content/private.json        # 隐私文章加密参数（公开的 salt 与迭代次数）
  theme/
    assets/icons.ts           # 跨配置与功能复用的内联 SVG 图标
    components/               # 全部 Vue 组件
      common/                 # 页面引言、访问徽章
      layout/                 # 布局、评论、页脚
      about/                  # 关于页内容
      home/                   # 首页文章区
      posts/                  # 公开文章归档、列表
      private/                # 隐私归档、列表、文章、翻页、侧栏、目录与密码圆点
      nav/                    # 导航分组与卡片
      links/                  # 友链展示
      sidebar/                # 侧栏扩展容器
    composables/              # 外观切换、图片放大、页面标识、最近使用记录
    features/                 # 各功能的类型与数据适配
      home/                   # 首页推荐类型（数据在 data/home.json）
      posts/                  # Post 类型、归档筛选适配、VitePress 加载器 posts.data.ts
      nav/                    # 导航类型（数据在 data/nav.json）
      links/                  # 友链类型（数据在 data/links.json）
      private/                # 隐私文章解密、会话密钥与侧栏可见状态
    custom.scss               # 全局 SCSS 入口
    styles/                   # 品牌色变量、功能性规则与第三方兼容修正
scripts/
  check.mjs                   # 校验统一入口（可传 assets/resources/styles/posts 子集）
  check-assets.mjs            # 文章、主题源码与 data/ 的图片引用校验
  check-resources.mjs         # 未引用 / 重复资源校验
  check-styles.mjs            # Vue 内联样式校验
  check-posts.mjs             # 文章元数据、URL 唯一性与 slug 校验
  export-mi-notes.mjs         # 从小米云便签导出 Markdown
  fs-utils.mjs                # 递归列文件等公共工具
  new.mjs                     # 新建内容统一入口
  new-post.mjs                # 新建文章
  new-nav.mjs                 # 添加导航项
  new-link.mjs                # 添加友链或追加链接
  new-home.mjs                # 添加首页推荐
  new-utils.mjs               # 新建脚本共用的路径、JSON 读写与校验
  pub.mjs                     # 只提交并推送 docs/ 与 data/ 内容改动
  optimize-images.mjs         # 大图转 WebP，原图保留为 .raw.<ext>
  private.mjs                 # 加密隐私文章，生成入口页与密文载荷
  prompt.mjs                  # 无依赖的交互式输入与方向键选择
```

配置层为数据驱动：`configs/` 下的数据文件只存放站点标识、导航、社交、页脚等数据，`theme.ts` 的 `buildThemeConfig(env)` 把它们组装成主题配置，`config.mts` 通过 `loadEnv` 读取环境变量后传入。需要经常增删的列表型内容放在根目录 `data/`，由 `features/<name>/data.ts` 导入并补上类型；JSON 属于构建期数据，不会被复制到站点产物。主题按类型分层：`components/` 存放全部 Vue 组件（`common`、`layout` 为通用组件，`home`、`posts`、`private`、`nav`、`links`、`sidebar` 按页面/功能分目录），`composables/` 存放组合式函数，`features/` 存放各功能的类型与数据适配（`data.ts`、`types.ts`，文章另有 VitePress 加载器 `posts.data.ts`），功能本地资源放在 `features/<name>/assets/`。相对导入保留 `.ts` 扩展名，`.vue`、`.mjs` 与资源文件保留原扩展名。

## 侧栏与顶栏

除首页外，所有页面显示同一套侧栏，配置在 `configs/sidebar.ts`：文章与导航都是可折叠列表，文章子项来自文章元数据，导航子项来自 `navData` 分组标题对应的页面锚点；关于和友链保持单页入口。隐私侧栏不写在静态配置里，而是由 `MPrivateSidebar` 在解锁后插入 `#sidebar-nav-after`，默认完全不可见。顶栏只保留主要内容入口，配置在 `configs/navbar.ts`。

需要新增侧栏挂件时，在 `theme/components/layout/MLayout.vue` 的 `#sidebar-nav-before` / `#sidebar-nav-after` 插槽中，把组件放进 `MSidebarWidgets` 容器即可，容器为空时自动隐藏。

## 公共资源与站点数据

`docs/public/` 按使用范围组织：多页共用的资源放 `shared/`，仅单页使用的资源放对应页面目录（如 `home/`、`about/`）。引用时使用绝对路径（如 `/shared/icon.png`），VitePress 会原样复制到产物。

`docs/public/` 只放需要原样发布的静态文件，不放站点数据。`public/` 下的内容会被整目录复制并可通过 URL 直接访问，不参与打包，也不受 TypeScript 与内容校验约束；而导航、友链、首页推荐、归档标签都是构建期数据，应该放在根目录 `data/`，由 `features/*/data.ts` 导入。除非将来要在浏览器运行时 `fetch` 数据，否则不需要把它们放进 `public/`。

导航站图标直接使用各站点的远程 URL，维护在 `data/nav.json`，不再随仓库保存本地副本。浏览器与 CDN 会按响应头缓存，避免重复下载；图标加载失败时 `MNavLink` 会回退为站点名称首字母。友链头像属于静态资源，仍放在 `docs/public/links/`，在 `data/links.json` 中填写 `/links/<文件名>`。每条友链包含 `avatar`、`name`、可选的 `desc` 和 `links` 数组，`desc` 会显示在卡片名称下方作为一句话简介，`links` 里可以放 GitHub、博客、RSS 等多个入口，每项写成 `{ "icon": "github", "url": "https://..." }`。新增导航、友链或首页推荐时优先使用 `pnpm new:nav`、`pnpm new:link`、`pnpm new:home`，脚本会写入对应 JSON 并做重复链接等基础校验；`pnpm new:link` 会在添加完一个链接后询问是否继续，也支持给已有友链追加链接。

常用内联 SVG 图标统一从 `theme/assets/icons.ts` 导出，包括 GitHub、哔哩哔哩、知乎、QQ、微信、微博、X、YouTube、Discord、Telegram、Gitee、Steam、Mastodon、Reddit、npm、Node、Vue、React、Python、Java、Linux、Apple、Windows、Android、HTML5、CSS3、JavaScript，以及 link、globe、rss、mail、blog、book、code、star、home、user、heart、rocket 等通用图标。`siteIcons` 提供名称到 SVG 的映射，`resolveSiteIcon(name)` 会在名称未知时回退到通用链接图标；友链 `links[].icon` 直接使用这些名称。

## 环境变量

需要配置集成（访问徽章、Giscus 评论）时，复制 `.env.example` 为 `.env.local` 并填写；`.env.local` 已被 `.gitignore` 忽略。变量在构建时由 `config.mts` 的 `loadEnv` 读取，经 `configs/integrations.ts` 解析进主题配置，未填写时对应组件不渲染：

- `VISITOR_BADGE_ID`：访问统计徽章，填入即启用。
- `GISCUS_REPO`、`GISCUS_REPO_ID`、`GISCUS_CATEGORY`、`GISCUS_CATEGORY_ID`：四项齐全才启用评论。
- `PRIVATE_POST_PASSWORD`：隐私文章的全站密码，只在本地 `pnpm private` 加密时使用，不要提交。若要使用关于页的六位圆点解锁，请设置为六位 `1/2/3`。

集成变量会写入站点产物，属于公开信息，不要放置密钥。CI 构建同样通过环境变量注入，仓库不保存真实值。`PRIVATE_POST_PASSWORD` 只写入 `.env.local`（已被忽略），不会进入产物。

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

文章头图默认从稿件目录的 `banner.*` 或 `cover.*` 自动匹配（`images/` 子目录也可），也可以用 frontmatter `banner: ./images/banner.webp` 指定，`banner: false` 关闭。头图保持图片原始比例，不做裁切。

`pnpm optimize` 会把 `docs/` 与 `data/` 中超过 300 KB 的 PNG / JPEG 转成 WebP，原图重命名为 `<name>.raw.<ext>` 留在原目录，并同步更新 Markdown、frontmatter 与数据文件里的引用。`pnpm pub` 会在提交前自动执行，需要跳过时加 `--no-optimize`。阈值与质量可调，例如 `pnpm optimize --threshold 1mb --quality 80`。`docs/public/` 会被整目录复制，因此不参与转换，避免 `.raw` 备份被一起发布。

新增稿件会进入首页与归档；侧栏在启动或构建时读取同一套元数据，开发时新增文章或修改侧栏标题后重启开发服务器。归档筛选标签维护在 `data/posts.json`，`Post` 类型在 `theme/features/posts/types.ts`。使用 `pnpm new:post` 可交互生成骨架；传齐 `pnpm new:post <slug> "标题"` 时不询问，适合脚本调用。

## 隐私文章

隐私文章使用浏览器端 AES-GCM 加密。公开站点里只有密文；标题、日期、标签、正文和头图都在加密清单或载荷里。隐私文章不进入公开归档、首页与普通侧栏，而是使用 `components/private/` 下的一套独立组件：归档、列表、文章、翻页、侧栏和右侧目录。

解锁流程：

- 默认隐藏。打开“关于”页，ABOUT 标签右侧有 6 个圆点；**空心/灰色/主题色分别代表 1/2/3**，点击循环，每次进入页面会随机初始化。
- 把圆点调成六位密码后，双击星野：校验通过会显示侧栏的“隐私”区块，同时解锁 `/private/`；再次双击会关闭区块并清除会话密钥。
- 圆点本身没有正确/错误反馈；双击星野始终会播放 shake，是否显示侧栏只由密码校验决定，两个交互互不等待。
- 也可以直接访问 `/private/`，把“隐私文章”大标题旁的六个圆点拨成同一个密码；解锁后侧栏区块同样会出现。
- 解锁后的会话密钥保存在 `sessionStorage`，同一标签页内打开任意隐私文章都不会再弹密码框；关闭标签页失效。

1. 用 `pnpm new:private <slug> "标题"` 或 `pnpm new:post <slug> "标题" --private` 创建明文源，也可以手动在 `private/posts/<slug>/index.md` 写。该目录已被 `.gitignore` 忽略，不会进入仓库；图片和头图放在同目录下并用相对路径引用。

   ```md
   ---
   title: 一篇隐私文章
   date: 2026-10-18
   tags: [随笔]
   banner: ./images/banner.webp
   ---

   # 一篇隐私文章

   <MPageIntro>这里可以直接使用全局注册的 Vue 组件。</MPageIntro>

   正文与图片都会进入密文。
   ```

2. 在 `.env.local` 写入全站密码：`PRIVATE_POST_PASSWORD=...`。密码必须是六位 `1/2/3`，因为关于页和 `/private/` 都只通过六个圆点输入；密码不要提交，也不要写进 `.env.example`。
3. 运行 `pnpm private`。脚本会读取 `private/posts/`，生成：
   - `docs/private/<slug>/index.md`：标题为“隐私文章”的公开入口页，只包含解密组件；
   - `docs/public/private/<slug>.<hash>.json`：加密后的标题、正文、头图与插图；
   - `docs/public/private/manifest.json`：加密的隐私文章清单，供 `/private/` 归档与侧栏使用。
4. 提交生成的文件即可。`private/` 与 `.env.local` 不提交；CI 构建只读取已提交的密文，不需要密码。
5. 修改明文后重新运行 `pnpm private`。修改密码后需要对所有隐私文章重新生成密文。删除隐私文章时，同时删除 `docs/private/<slug>/` 和对应的 `docs/public/private/<slug>.*.json`。

隐私文章走 `/private/` 归档和 `/private/<slug>` 文章页；`config.mts` 的 rewrite 与 posts 路由对应。文章页会显示加密头图、正文、右侧目录和前后篇翻页；评论和协议卡片关闭。侧栏“隐私”区块由 `MPrivateSidebar` 渲染，放在 `MLayout.vue` 的 `#sidebar-nav-after` 插槽；不想要这个入口时移除该组件即可，`/private/` 地址仍然可用。

隐私文章的标题、日期和标签只存在于加密清单与正文中，公开页面不会提前展示；归档的标签筛选沿用 `data/posts.json` 的默认标签，并合并隐私文章自己的标签。头图默认自动匹配源目录下的 `banner.*` / `cover.*`（`images/` 子目录也可以），也可以用 `banner` 指定相对路径；本地头图会随正文一起加密，解锁后才显示。`banner: false` 可关闭。

正文支持标准 Markdown、代码块、KaTeX、相对路径图片，以及**全局注册的 Vue 组件**。脚本在构建时把 Markdown 渲染成 HTML，浏览器解锁后再把它编译成 Vue 模板，因此 `MPageIntro`、`MAbout` 这类全局组件可以直接使用；未注册的局部组件不会生效。行内代码和代码块里的 `{{ }}` 会保持原样，普通正文里的 `{{ }}` 会按 Vue 插值处理。

头图和正文图片都会转成 WebP data URL 内联进密文，不会复制到 `public/`。

`/private/<slug>` 里的 slug 仍然是公开的，敏感文章建议使用不容易猜到的名字。六位 `1/2/3` 密码只有 729 种组合，PBKDF2 也不足以抵御离线穷举；它更像一个隐藏入口而不是强密码。如果以后需要真正保密，需要另外恢复一个长密码输入入口，当前只有圆点输入。

## 组件与样式

Markdown 负责内容，主题负责展示。页面可以直接使用已注册的 `MPageIntro`、`MAbout`、`MHomeContent`、`MPostArchive`、`MNav`、`MLinks`，无需导入主题内部路径。

组件自身样式统一放在 `<style lang="scss" scoped>`，只保留布局、间距、边框与颜色；字号、行高、字重等排版交给 VitePress 默认值。`theme/styles/` 放品牌色变量（`_tokens.scss`）、少量功能性规则（`_base.scss`，如 katex 横向滚动、medium-zoom、焦点轮廓）和第三方依赖的兼容修正（`_fix.scss`），由 `custom.scss` 使用 Sass 的 `@use` 加载，不使用已弃用的 Sass `@import`。颜色继续引用 VitePress 的 CSS 自定义属性，以支持明暗主题切换；第三方依赖的 CSS 直接导入，不复制或改写，确需兼容修正时集中放在 `_fix.scss` 并注明移除条件。Vite 通过 `sass-embedded` 的现代编译器 API 编译 SCSS。

不要使用 `style="..."`、`:style` 或通过 DOM 的 `.style` 修改布局；图片失败和条件显示使用 Vue 状态与 `v-if`。外观切换的圆形过渡通过 Web Animations API 实现，保留系统的减少动态效果设置。

全仓 Prettier 使用 `.prettierrc` 中的 `printWidth: 120`，其余选项沿用默认值。`pnpm format` 执行格式化，`pnpm format:check` 只检查；依赖和构建缓存由 `.prettierignore` 排除。Markdown 中的 C / C++ 代码样例仍属于文章内容，格式化器不会编译或修正它们。
