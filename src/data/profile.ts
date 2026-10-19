import type { Profile } from '../types'

/** 个人信息配置：改内容不改代码 */
export const profile: Profile = {
  name: '林星河',
  /** Hero 打字机轮播的头衔 */
  titles: ['全栈工程师', 'React 开发者', '开源爱好者'],
  slogan: '在代码的星空中，构建属于自己的宇宙',
  bio: [
    '一名热爱前端与全栈开发的工程师，专注于 React 生态与现代化 Web 体验。',
    '喜欢把复杂问题拆解成简洁的方案，相信好的代码和好的设计一样优雅。',
    '业余时间写博客、做开源，持续探索技术的边界。',
  ],
  location: '上海',
  experience: '5 年经验',
  status: '在职 · 考虑机会',
  education: '计算机科学与技术 · 本科',
  email: 'hi@example.com',
  socials: [
    { name: 'GitHub', url: 'https://github.com/' },
    { name: '掘金', url: 'https://juejin.cn/' },
    { name: 'Email', url: 'mailto:hi@example.com' },
  ],
  /** 头像（AI 生成示意图，可替换为真实照片） */
  avatar:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20developer%20portrait%20avatar%20illustration%2C%20minimal%20flat%20style%2C%20young%20engineer%20with%20glasses%2C%20dark%20blue%20purple%20gradient%20background%2C%20soft%20glow&image_size=square',
  timeline: [
    { period: '2022 — 至今', title: '高级前端工程师', org: '某科技公司', desc: '负责核心业务前端架构与性能优化' },
    { period: '2020 — 2022', title: '前端工程师', org: '某互联网公司', desc: '参与中后台系统与组件库建设' },
    { period: '2016 — 2020', title: '本科', org: '某大学 · 计算机科学与技术', desc: '主修 Web 技术与软件工程' },
  ],
}
