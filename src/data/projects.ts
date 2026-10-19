import type { Project } from '../types'

/** 项目数据：featured 为 true 的项目置顶展示，content 为 Markdown 详情 */
const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`

export const projects: Project[] = [
  {
    id: 'nebula-dashboard',
    title: 'Nebula 数据看板',
    desc: '面向运营团队的实时数据可视化平台，支持自定义报表与多端查看。',
    tech: ['React', 'TypeScript', 'ECharts', 'Node.js'],
    cover: img('dark analytics dashboard web app UI, charts and graphs, deep blue purple theme, modern SaaS interface, screenshot style'),
    date: '2026-06-01',
    demo: 'https://example.com',
    source: 'https://github.com/',
    featured: true,
    content: `## 项目背景

运营团队依赖人工导出 Excel 统计数据，效率低且容易出错，需要一个实时可视化的数据看板。

## 我的职责

独立负责前端架构设计与实现，参与后端接口设计。

## 亮点与成果

- 首屏加载时间从 4s 优化到 1.2s（懒加载 + 虚拟滚动）
- 封装可配置的图表组件，新报表接入成本降低 70%
- 支持暗色主题与移动端自适应`,
  },
  {
    id: 'starlight-blog',
    title: 'Starlight 博客系统',
    desc: '基于 Markdown 的静态博客生成器，支持代码高亮、目录与全文搜索。',
    tech: ['React', 'Vite', 'Markdown'],
    cover: img('minimal dark blog website UI, article list with code blocks, starry night theme, modern typography'),
    date: '2026-04-15',
    source: 'https://github.com/',
    featured: true,
    content: `## 项目背景

希望有一个轻量、可完全自定义的博客系统，沉淀技术文章。

## 我的职责

独立完成设计与开发。

## 亮点与成果

- 构建时生成静态页面，Lighthouse 性能 95+
- 支持 frontmatter 元数据与标签筛选
- 实现构建期全文搜索索引，无需后端`,
  },
  {
    id: 'orbit-components',
    title: 'Orbit 组件库',
    desc: '公司内部 React 组件库，覆盖 40+ 组件，支撑 5 条业务线。',
    tech: ['React', 'TypeScript', 'Storybook'],
    cover: img('UI component library showcase, buttons cards forms on dark background, design system, purple accent'),
    date: '2025-11-20',
    source: 'https://github.com/',
    content: `## 项目背景

多条业务线重复造轮子，UI 风格不统一，需要统一的组件库。

## 我的职责

主导组件库架构与核心组件开发。

## 亮点与成果

- Design Token 体系支持多主题切换
- 单元测试覆盖率 85%+，Storybook 文档完备
- 按需加载，业务包体积平均减少 30%`,
  },
  {
    id: 'comet-cli',
    title: 'Comet CLI 脚手架',
    desc: '一行命令生成项目骨架的 CLI 工具，内置模板市场与插件机制。',
    tech: ['Node.js', 'TypeScript'],
    cover: img('terminal command line interface with colorful output, dark theme, developer tool'),
    date: '2025-08-10',
    source: 'https://github.com/',
    content: `## 项目背景

新项目初始化重复配置耗时，团队需要标准化的脚手架工具。

## 我的职责

独立设计与开发。

## 亮点与成果

- 模板远程拉取 + 本地缓存，秒级生成项目
- 插件机制支持团队自定义脚手架流程
- 团队 20+ 项目使用，初始化时间从半天缩短到 1 分钟`,
  },
]
