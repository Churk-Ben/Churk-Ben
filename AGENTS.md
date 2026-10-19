# AGENTS.md

## 项目概览

- VitePress 2（alpha）个人博客，Vue 3 + TypeScript + Sass；Node 24 / pnpm 12（见 `.node-version`、`package.json`）。
- `docs/` 是页面内容，`data/*.json` 是构建期数据，`.vitepress/` 是配置与主题。
- 保持现有配色、顶栏与站点标识；日常维护优先复用主题变量和现有组件。

## 基本命令

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm typecheck
pnpm format:check
pnpm build
```

完整脚本说明见 `CONTRIBUTING.md`。

## 内容位置

- `docs/posts/<slug>/index.md`：公开文章；图片放同目录 `images/`，用相对路径。
- `private/posts/<slug>/`：隐私文章明文源，已被忽略，不要提交。
- `docs/private/`、`docs/public/private/`：`pnpm private:build` 的生成物，需要提交。
- `data/`：导航、友链、首页推荐、归档标签；不要放进 `docs/public/`。
- `.vitepress/configs/`：站点数据与配置组装；`.vitepress/theme/`：组件、composables、features、styles。
- `scripts/`：new / check / private / export / pub 等 Node 脚本。

## 约定

- 组件样式写在 `<style lang="scss" scoped>`；禁止内联 `style="..."`、`:style` 或 DOM `.style`（`check-styles` 会失败）。
- 相对导入保留扩展名，如 `.ts`、`.vue`、`.mjs`。
- Prettier 使用 `printWidth: 120`；提交前跑 `pnpm format:check`。
- 已有文章正文与代码示例保持原样，除非任务明确要求修改。
- 新增内容优先用 `pnpm new:*`；新增列表数据放 `data/`，由 `features/<name>/data.ts` 导入并补类型。
- 不要提交 `.env.local`、`private/`、`import/`；公开产物中不得出现密码或明文隐私文章。
- 提交前至少运行 `pnpm check` 与 `pnpm typecheck`。
