# AGENTS.md — AI 编码代理工作指南

本文件供 AI 编码代理（Claude Code、Cursor、Codex 等）在本仓库工作时遵循。请先通读再动手。

## 项目概述

深色星空主题的个人作品集网站（前台展示）+ 后台内容管理系统（/admin）。数据层为 localStorage 模拟的统一 API，设计上可平滑替换为真实后端。

- 技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS 3.4 + React Router 7 + React Hook Form + Zod
- 语言约定：对话与 UI 文案用中文，代码注释用中文

## 常用命令

```bash
npm run dev       # 开发服务器（前台 / 后台 /admin）
npm run build     # tsc -b && vite build —— 改完代码必须跑一次验证
npm run preview   # 预览构建产物
npm run lint      # oxlint
```

TypeScript 为严格模式且启用 `noUnusedLocals`：**未使用的变量/导入会直接导致 build 失败**。提交前务必 `npm run build` 通过。

## 架构铁律

1. **数据读写只走 `src/api/`**（profileApi / skillsApi / projectsApi / postsApi / settingsApi / authApi），任何组件禁止直接 `localStorage.getItem/setItem`。
2. **类型只定义在 `src/types/index.ts`**，前台与后台共用；不要在组件内重复声明结构相同的类型。
3. **API 方法签名保持 async / Promise**——这是为将来换真实后端预留的契约。
4. **前台展示与后台管理必须同步**：修改某字段的结构时，同时检查 `types`、`src/api`（种子写入）、后台对应编辑页、前台对应展示区块四处。

## 关键模块速查

| 需求 | 位置 |
|---|---|
| 统一类型 | `src/types/index.ts` |
| API 层 / 种子数据 / resetAll | `src/api/{index,storage,auth}.ts` |
| 路由表与守卫 | `src/App.tsx`、`src/admin/RequireAuth.tsx` |
| 后台布局（侧边栏/顶栏） | `src/admin/AdminLayout.tsx` |
| 后台共享表单样式 | `src/admin/components/ui.ts` |
| 删除二次确认 | `src/admin/components/ConfirmDialog.tsx`（破坏性操作必须经过它） |
| Markdown 编辑器 | `src/admin/components/MarkdownEditor.tsx` |
| Markdown 渲染 | `src/lib/markdown.ts` 的 `renderMarkdown`（勿另起炉灶） |
| 异步取数 | `src/hooks/useData.ts` |
| 种子数据 | `src/data/*.ts`、`src/content/blog/*.md` |
| 主题配色 | `tailwind.config.js`（space/nebula/starcyan/starlight/mist） |

## 常见任务怎么做

- **新增后台页面**：`admin/pages/` 建组件 → `App.tsx` 注册路由（通常挂在 RequireAuth + AdminLayout 之下）→ `AdminLayout.tsx` 侧边栏加 NavLink。表单用 RHF + zodResolver + `ui.ts` 共享样式。
- **修改默认内容**：改 `src/data/` 或 `src/content/blog/`。注意：**种子只在 localStorage 为空时播种**，用户浏览器已有数据时改种子不生效，需「站点设置 → 重置全部数据」。
- **新增 Post/Project 字段**：改类型 → 后台编辑表单（含 zod schema 与 `reset` 回填、提交映射三处）→ 前台展示。字段一律可选（`?`），保证旧数据兼容。
- **改样式**：优先用 Tailwind 主题 token 与 `ui.ts` 共享类；前台 Markdown 排版改 `index.css` 的 `.post-content`。

## 已踩过的坑（务必遵守）

1. **zod 必须保持 v3**（当前 ^3.25）。`@hookform/resolvers@3.x` 不兼容 zod 4：升级后表单提交时校验器抛 `ZodError` 且 Promise 永不 resolve，表现为按钮永久卡在「登录中…/保存中…」。不要执行 `npm install zod@latest`；若要升级需同步升 resolvers 并全量回归所有表单。
2. **flex 行内使用 `inputClass` 会挤压兄弟输入框**：`inputClass` 自带 `w-full`，flex 容器里定宽项写 `${inputClass} !w-36 shrink-0`，自适应项写 `${inputClass} min-w-0 flex-1`（参考 `ProfileAdmin.tsx` 社交链接行）。
3. **改依赖后需重启 dev server**：Vite 对依赖有预构建缓存，降级/升级包后不重启 `npm run dev` 会继续跑旧包，出现「改了没用」的假象。
4. **删除/重置等破坏性操作必须经 `ConfirmDialog` 二次确认**，无例外。
5. **头像等上传图片必须压缩后存 data URL**（参考 `ProfileAdmin.tsx` 的 `fileToAvatarDataUrl`：canvas 裁方 256×256、JPEG 0.85），原始 base64 会撑爆 localStorage。
6. **Markdown 渲染走 `dangerouslySetInnerHTML`**：内容源当前仅站长（受登录保护），不要把它扩展到不可信输入；若需要，先加 DOMPurify。

## 代码风格

- 函数组件 + 具名导出 default；hooks 顶层调用
- 注释只写「为什么」，不写「是什么」；中文
- 不引入重型 UI 库（antd/MUI 等）；轻量依赖（RHF/zod/marked）已是全部
- 不做超出当前需求的重构/抽象；改完跑 `npm run build` 验证
