import type { Profile } from '../types'

/** 个人信息配置：改内容不改代码 */
export const profile: Profile = {
  name: '林珊珊',
  /** Hero 打字机轮播的头衔 */
  titles: ['全栈工程师', 'React 开发者', '开源爱好者'],
  slogan: '在代码的星空中，构建属于自己的宇宙',
  bio: [
    '一名热爱前端与全栈开发的工程师，专注于 React 生态与现代化 Web 体验。',
    '喜欢把复杂问题拆解成简洁的方案，相信好的代码和好的设计一样优雅。',
    '业余时间写博客、做开源，持续探索技术的边界。',
  ],
  location: '大连',
  experience: '应届毕业生',
  status: '求职 · 考虑机会',
  education: '软件工程 · 本科',
  email: 'hi@example.com',
  socials: [
    { name: 'GitHub', url: 'https://github.com/X-jq/' },
    { name: 'CSDN', url: 'https://blog.csdn.net/2301_80027830?spm=1000.2115.3001.5343' },
  ],
  /** 头像：指向 public/avatar.jpg，替换图片文件即可换头像 */
  avatar: '/avatar.jpg',
  timeline: [
    { period: '2023 — 2027', title: '本科', org: '大连海事大学 · 软件工程', desc: '数据结构、计算机组成原理' },
  ],
}
