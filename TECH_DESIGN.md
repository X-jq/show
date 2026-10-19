# 技术设计文档（TECH_DESIGN）

本文档描述个人作品集网站（前台 + 后台管理系统）的架构设计、核心模块与关键技术决策。

## 1. 总体架构

应用为单页应用（SPA），前后台共用一个 React 应用实例，通过路由隔离：

```
┌─────────────────────────────────────────────────┐
│                 页面层（React 组件）              │
│   前台：sections/* + HomePage                    │
│   后台：admin/pages/* + AdminLayout              │
├─────────────────────────────────────────────────┤
│            统一数据层（src/api/）                 │
│   index.ts ─ 五组资源 CRUD（全部 Promise）        │
│   auth.ts  ─ 登录 / 鉴权 / 修改密码               │
│   storage.ts ─ localStorage 封装 + 种子初始化     │
├─────────────────────────────────────────────────┤
│        localStorage（key 前缀 portfolio:）       │
└─────────────────────────────────────────────────┘
```

设计原则：**页面组件不直接触碰 localStorage**，一律通过 `src/api/` 读写。API 方法签名与 REST 语义对齐（list/get/create/update/remove），后续接入真实后端时仅替换 `src/api/` 内部实现为 HTTP 请求，页面代码零改动。

## 2. 路由设计

| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | HomePage | 前台单页（Hero/About/Skills/Projects/Blog/Contact） |
| `/admin/login` | Login | 登录页（已登录自动重定向） |
| `/admin` | RequireAuth → AdminLayout | 后台壳（未登录跳 login） |
| `/admin` (index) | Dashboard | 统计概览 |
| `/admin/profile` | ProfileAdmin | 个人信息 |
| `/admin/skills` | SkillsAdmin | 技能管理 |
| `/admin/projects` / `new` / `:id` | ProjectsAdmin / ProjectEdit | 项目列表与编辑（新建与编辑共用表单组件） |
| `/admin/posts` / `new` / `:slug` | PostsAdmin / PostEdit | 博客列表与编辑 |
| `/admin/settings` | Settings | 站点设置 / 改密码 / 重置数据 |

**路由守卫**：`RequireAuth` 在渲染子树前调用 `isAuthed()`，未登录渲染 `<Navigate to="/admin/login" replace />`。守卫只在 `/admin` 分支挂载，前台路由不受影响。

**布局隔离**：后台使用独立 `AdminLayout`（固定侧边栏 + 顶栏 + 移动端抽屉），不复用前台 `Navbar`/`StarField`。

## 3. 类型系统

全站类型收敛在 `src/types/index.ts`，前台展示与后台表单共用同一份定义，禁止组件内自定义重复类型：

| 类型 | 用途 | 关键字段 |
|---|---|---|
| `Profile` | 个人信息 | titles[]（打字机轮播）、bio[]、socials、timeline |
| `SkillCategory` / `Skill` | 技能 | name + level（0-100） |
| `Project` | 项目 | id、tech[]、featured、content（Markdown 源文） |
| `Post` | 文章 | slug（URL 标识）、tags[]、external?（外链）、content（Markdown 源文） |
| `SiteSettings` | 站点设置 | siteName / siteDescription / footerText |

`Project.content` 与 `Post.content` 均存 Markdown **源文**，渲染在展示时进行（而非入库时预渲染），保证后台可继续编辑。

## 4. 数据层设计

### 4.1 storage.ts

- 统一命名空间：所有 key 以 `portfolio:` 为前缀（如 `portfolio:posts`、`portfolio:auth`）
- `readJSON / writeJSON` 薄封装，带异常兜底
- `ensureSeeded()`：首次访问时把 `src/data/`（profile、skills、projects）与 `src/content/blog/*.md`（经 `import.meta.glob` 构建期内联，`lib/posts.ts` 解析 frontmatter）写入 localStorage，并置 `seeded` 标记
- `resetAll()`：清空命名空间下全部 key（供后台「危险区」调用）

### 4.2 api/index.ts

五组资源 API：`profileApi / skillsApi / projectsApi / postsApi / settingsApi`。

- 全部方法 `async`，返回 `Promise` —— 与未来 HTTP 版语义一致
- 排序规则内聚在 API 层：项目 featured 优先 + date 降序；文章 date 降序
- 唯一性约束在 API 层校验：`postsApi.create` 对 slug 查重、抛错由表单展示

### 4.3 种子机制与数据边界

种子数据 = **出厂默认值**，localStorage = **当前生效数据**。修改种子文件对已有浏览器数据不生效，需「重置全部数据」或清空 localStorage 重新播种。

## 5. 鉴权方案

### 流程

```
login(username, password)
  → Web Crypto.subtle 计算 sha256(password)
  → 与 localStorage 中的 pwdhash 比对（默认哈希对应 admin123）
  → 成功：写入 { token: crypto.randomUUID(), expiresAt: now + 7d }
  → 失败：抛错，登录页提示「用户名或密码错误」

isAuthed()  // RequireAuth 与顶栏共用
  → auth 存在 且 未过期（过期自动清除）
```

### 安全设计

- localStorage 只存 **SHA-256 哈希** 与 **随机 token**，不存明文密码
- `changePassword(old, new)`：验证旧密码后写入新哈希
- token 仅为登录态标识（当前无服务端），有效期 7 天

### 已知局限（有意为之）

本方案为纯前端演示定位。接入真实后端时的演进路径：哈希比对 → 服务端 bcrypt + httpOnly Session/JWT；`isAuthed()` 改为请求 `/me` 接口；`src/api/auth.ts` 的函数签名保持不变，页面无需改动。

## 6. Markdown 渲染管线

`src/lib/markdown.ts` 提供唯一入口：

```
renderMarkdown(content) → { html, toc, readingTime }
```

- **marked + marked-highlight**：代码高亮按需注册 7 种语言（js/ts/python/bash/css/json/html），避免全量语言包
- **toc**：walkTokens 收集 h2/h3，前台文章页用于目录导航与滚动高亮
- **readingTime**：中文按约 300 字/分钟估算
- **共用点**：前台文章详情、项目详情弹窗、后台 MarkdownEditor 预览均调用此函数，保证三处渲染一致
- CSS 排版统一走全局 `.post-content` 类

## 7. 表单与校验

后台所有表单统一模式：**React Hook Form + zodResolver(Zod schema)**。

- 简单表单（登录、站点设置）：`register` 直接绑定
- 动态行（社交链接、经历时间线）：`useFieldArray` 增删行
- 受控编辑器（Markdown 正文）：`Controller` 包装 `MarkdownEditor`
- 编辑页模式：`useEffect` 异步取数后 `reset(serverData)` 回填；新建与编辑共用组件，按路由参数区分
- 校验规则示例：slug `^[a-z0-9-]+$`、URL 字段 `z.string().url().or(z.literal(''))`、文章「正文与外链至少其一」用 `superRefine` 交叉校验

**版本约束（重要）**：`@hookform/resolvers@3.x` 仅兼容 **zod v3**。若升级到 zod v4，`zodResolver` 内部会抛 `ZodError` 且 Promise 悬挂，表现为提交按钮永久卡在「保存中…」（本项目实测踩坑）。

## 8. 样式体系

### 主题 Token（tailwind.config.js）

| Token | 色值 | 语义 |
|---|---|---|
| `space` / `space-card` | `#0B0E1A` / `#141A2E` | 背景 / 卡片 |
| `nebula` | `#7C6CFF` | 主强调（紫） |
| `starcyan` | `#4FD1C5` | 次强调（青） |
| `starlight` | `#FFD166` | 点缀（黄） |
| `mist` / `mist-dim` | `#E6EAF2` / `#9AA3B5` | 主文字 / 次文字 |

### 共享样式

- `admin/components/ui.ts`：`inputClass / labelClass / btnPrimary / btnSecondary / btnDanger / cardClass` —— 后台表单视觉一致性的单一来源
- `.post-content`：Markdown 排版（标题/列表/代码块/引用）
- `Reveal` 组件：IntersectionObserver 滚动渐入

### 已知约束

`inputClass` 自带 `w-full`，在 **flex 行内**与定宽/flex 类冲突会导致兄弟输入框被挤压为 0 宽（社交链接行实测踩坑）。flex 行内必须写成 `${inputClass} !w-36 shrink-0` 与 `${inputClass} min-w-0 flex-1`。

## 9. 关键实现细节

### 9.1 头像本地上传

```
File → objectURL → Image 解码
  → canvas 居中裁方 256×256（cover 裁剪）
  → toDataURL('image/jpeg', 0.85) → data URL
  → setValue('avatar') → 存入 profile
```

裁剪压缩将体积控制在数十 KB，避免 base64 撑爆 localStorage（约 5MB 上限）。

### 9.2 外链文章

`Post.external` 可选字段：填写后前台卡片点击 `window.open(external)` 新标签跳转，不进入站内详情；卡片与后台列表显示「外链」标识；表单校验放宽为「正文与外链至少其一」。

### 9.3 删除二次确认

通用 `ConfirmDialog`（title/message/onConfirm），所有破坏性操作（删项目/文章/技能分类/重置数据）必须经过它。

### 9.4 useData Hook

```ts
useData<T>(loader: () => Promise<T>): T | null
```

页面级异步取数的最小封装（useEffect + useState），前台区块用它在 null 时渲染加载态。

## 10. 安全考量

- **XSS 面**：Markdown 经 `marked.parse` 后通过 `dangerouslySetInnerHTML` 渲染。当前内容源仅为站长本人（后台受登录保护），风险可接受；若开放多人投稿，必须引入 DOMPurify 消毒
- **密码存储**：SHA-256 仅防「明文泄露」，非加盐慢哈希；真实后端应换 bcrypt/argon2（见 §5）
- **数据边界**：localStorage 数据可被用户在 DevTools 任意篡改，后台「管理能力」仅是展示层约束，真实权限必须由服务端执行

## 11. 构建与部署

- `npm run build`：`tsc -b`（严格模式 + noUnusedLocals）+ `vite build`
- 产物为纯静态 `dist/`，可托管于 Vercel / Netlify / GitHub Pages
- GitHub Pages 部署需在 `vite.config.ts` 配置 `base` 为仓库子路径，并以 404 重定向兜底 BrowserRouter 刷新
