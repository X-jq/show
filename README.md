# 个人作品集网站

一个深色星空主题的个人作品集网站，内置后台管理系统。前台展示个人信息、技能、项目与博客；后台支持在线编辑所有内容，数据通过统一 API 层读写（当前为 localStorage 模拟，可平滑切换真实后端）。

## 技术栈

| 类别     | 技术                                     |
| -------- | ---------------------------------------- |
| 框架     | React 19 + TypeScript                    |
| 构建     | Vite 8                                   |
| 样式     | Tailwind CSS 3.4（深色主题自定义配色）   |
| 路由     | React Router 7（前台 / 后台路由隔离）    |
| 表单     | React Hook Form + Zod 校验               |
| Markdown | marked + highlight.js（渲染 + 代码高亮） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（前台 http://localhost:5173，后台 /admin）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview
```

## 功能

### 前台

- 星空动态背景 + 打字机轮播头衔的 Hero 区块
- 关于我（头像、简介、社交链接、经历时间线）
- 技能展示（分类 + 熟练度）
- 项目展示（技术栈筛选、精选置顶、Markdown 详情弹窗）
- 博客（标签筛选、文章详情、目录导航、外链文章跳转）
- 滚动渐入动画、响应式布局（PC / 平板 / 手机）

### 后台（/admin）

| 路由              | 功能                                                           |
| ----------------- | -------------------------------------------------------------- |
| `/admin/login`    | 账号密码登录                                                   |
| `/admin`          | 仪表盘（内容统计 + 最近文章）                                  |
| `/admin/profile`  | 个人信息（基本信息 / 社交链接 / 经历时间线，头像支持本地上传） |
| `/admin/skills`   | 技能分类与熟练度管理                                           |
| `/admin/projects` | 项目列表 + 新建 / 编辑（Markdown 实时预览）                    |
| `/admin/posts`    | 博客列表 + 新建 / 编辑（支持外链文章）                         |
| `/admin/settings` | 站点设置、修改密码、重置数据                                   |

**默认账号：`admin` / `admin123`**（可在后台「站点设置」中修改密码）

### 后台特性

- **路由守卫**：未登录访问 `/admin/*` 自动跳转登录页，token 有效期 7 天
- **安全**：密码仅存 SHA-256 哈希，localStorage 中不存明文；登录成功后签发随机 token
- **表单校验**：全部表单使用 Zod（slug 格式 / URL 格式 / 必填项 / 两次密码一致等）
- **删除二次确认**：项目、文章、技能分类等删除操作均弹出确认对话框
- **Markdown 编辑器**：左侧编辑、右侧实时预览（移动端为 Tab 切换）
- **外链文章**：文章填写「外部链接」后，前台卡片点击直接跳转外站（如掘金 / CSDN）
- **本地上传头像**：自动居中裁方并压缩为 256×256 JPEG 存入浏览器

## 数据层说明

所有数据读写集中在 `src/api/`：

```
src/api/
├── storage.ts   # localStorage 封装 + 首次访问时写入种子数据 + resetAll
├── auth.ts      # 登录 / 登出 / 鉴权 / 修改密码
└── index.ts     # profile / skills / projects / posts / settings 五组 CRUD
```

- 所有 API 方法均为 `async` 并返回 `Promise`，后续接入真实后端时只需替换 `src/api/` 内部实现，页面代码无需改动
- 首次访问会把 `src/data/`（个人信息、技能、项目）与 `src/content/blog/*.md`（博客种子）写入 localStorage
- 数据保存在浏览器本地，清除浏览器数据或使用后台「重置全部数据」后恢复为种子内容

## 目录结构

```
├── public/                  # 静态资源（可直接放图片，URL 用 /xxx.jpg 引用）
├── src/
│   ├── api/                 # 统一数据层（localStorage 模拟）
│   ├── admin/               # 后台
│   │   ├── components/      #   ConfirmDialog / MarkdownEditor / 共享样式
│   │   ├── pages/           #   登录、仪表盘、各管理页
│   │   ├── AdminLayout.tsx  #   后台布局（侧边栏 + 顶栏）
│   │   └── RequireAuth.tsx  #   路由守卫
│   ├── components/          # 前台通用组件（Navbar / StarField / PostView 等）
│   ├── content/blog/        # 博客种子文章（Markdown + frontmatter）
│   ├── data/                # 种子数据（profile / skills / projects）
│   ├── hooks/               # useData（异步数据加载 Hook）
│   ├── lib/                 # markdown 渲染、博客种子解析
│   ├── pages/               # HomePage（前台首页）
│   ├── sections/            # 前台区块（Hero / About / Skills / Projects / Blog / Contact）
│   ├── types/               # 全站统一类型定义
│   └── App.tsx              # 路由入口
└── tailwind.config.js       # 主题配色：space / nebula / starcyan / starlight / mist
```

## 常用自定义

| 想改什么         | 做法                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 网站文字内容     | 后台对应管理页在线编辑（推荐），或修改 `src/data/` 种子数据                           |
| 新增博客种子文章 | 在 `src/content/blog/` 新建 `.md`，头部写 `title / date / tags / excerpt` frontmatter |
| 主题配色         | `tailwind.config.js` 中修改 `space / nebula / starcyan` 等色值                        |
| 默认密码         | 改 `src/api/auth.ts` 中的默认哈希常量，或登录后在「站点设置」修改                     |
| 接入真实后端     | 保持 `src/api/index.ts` 的方法签名，内部替换为 HTTP 请求即可                          |

## 部署

```bash
npm run build
```

构建产物在 `dist/`，为纯静态文件，可部署到任意静态托管平台：

- **Vercel / Netlify**：导入仓库，构建命令 `npm run build`，输出目录 `dist`
- **GitHub Pages**：注意在 `vite.config.ts` 设置 `base` 为仓库名路径；因路由使用 BrowserRouter，建议配合 404 重定向到 `index.html`

> 注意：数据目前存于浏览器 localStorage，部署后每个访客浏览器独立；后台管理仅用于站长本人维护内容（本地存储方案下，访客看到的仍是种子数据 + 站长浏览器中修改的内容）。若需多人共享后台数据，请按「数据层说明」接入真实后端。
