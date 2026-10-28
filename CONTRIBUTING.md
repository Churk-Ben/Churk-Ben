# 维护博客

博客基于 VitePress。使用 `.node-version` 指定的 Node.js 24 与 `package.json` 固定的 pnpm 12.11.2，在仓库根目录运行。

首次安装依赖：`pnpm install --frozen-lockfile`。

## pnpm 脚本

| 脚本                                        | 作用                                                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                  | 启动本地开发服务器（热更新）。                                                                            |
| `pnpm build`                                | 构建生产站点，并检查站内链接。                                                                            |
| `pnpm preview`                              | 预览已构建的站点。                                                                                        |
| `pnpm check`                                | 运行全部内容校验；可传 `assets`、`resources`、`styles`、`posts` 只跑指定子集。                            |
| `pnpm check:assets`                         | 校验文章、主题源码与 `data/` 中引用的本地图片。                                                           |
| `pnpm check:resources`                      | 校验未引用或重复的静态资源；会先执行 assets。                                                             |
| `pnpm check:styles`                         | 检查 Vue 组件是否使用内联样式。                                                                           |
| `pnpm check:posts`                          | 校验文章元数据、slug 与 URL 唯一性。                                                                      |
| `pnpm new`                                  | 交互式新建内容：文章、导航、友链、推荐。                                                                  |
| `pnpm new:post [slug] ["标题"] [--private]` | 新建文章骨架；交互时选择公开或隐私，`--private` 直接写入 `private/posts/`。                               |
| `pnpm new:private [slug] ["标题"]`          | 直接新建隐私文章骨架。                                                                                    |
| `pnpm new:nav`                              | 交互添加导航项。                                                                                          |
| `pnpm new:link`                             | 交互添加友链，或给已有友链追加链接。                                                                      |
| `pnpm new:home`                             | 交互添加首页推荐阅读。                                                                                    |
| `pnpm private`                              | 同 `private:build`。                                                                                      |
| `pnpm private:build`                        | 加密 `private/posts/`，生成隐私文章页面与密文，并复用未变化文章的密文。                                   |
| `pnpm private:clean`                        | 清理已从 `private/posts/` 删除的文章生成物，无需重新加密。                                                |
| `pnpm export`                               | 交互选择要导出的内容。                                                                                    |
| `pnpm export:mi-notes`                      | 从小米云便签导出 Markdown；需要 `private/mi-cookie.txt` 或 `MI_COOKIE`。                                  |
| `pnpm pub [说明]`                           | 只提交并推送 `docs/` 与 `data/` 的内容改动；`--no-optimize` 跳过图片优化，`--no-push` 只提交不推送。      |
| `pnpm optimize`                             | 把 `docs/` 与 `data/` 中超过 300 KB 的图片转为 WebP；可用 `--threshold <大小>`、`--quality <质量>` 调整。 |
| `pnpm typecheck`                            | 用 `vue-tsc` 检查 `.vitepress/` 的 TypeScript 与 Vue 组件。                                               |
| `pnpm format`                               | 用 Prettier 格式化全仓。                                                                                  |
| `pnpm format:check`                         | 只检查格式，不写入文件。                                                                                  |

交互命令需要终端；`pnpm new` 的一级菜单只列出文章、导航、友链、推荐四项。`pnpm publish` 是 pnpm 自带命令，发布博客内容请使用 `pnpm pub`。

## 缓存

生产环境会在浏览器注册 `docs/public/sw.js`，缓存哈希资源、图片与字体，并对页面使用 network-first。修改缓存策略时请同步更新该文件的 `VERSION`；开发环境不会注册 Service Worker。
