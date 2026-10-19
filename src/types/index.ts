/** 全站统一数据类型：前台与后台共用 */

export interface SocialLink {
  name: string
  url: string
}

export interface TimelineItem {
  period: string
  title: string
  org: string
  desc: string
}

export interface Profile {
  name: string
  /** Hero 打字机轮播头衔 */
  titles: string[]
  slogan: string
  bio: string[]
  location: string
  experience: string
  status: string
  education: string
  email: string
  avatar: string
  socials: SocialLink[]
  timeline: TimelineItem[]
}

export interface Skill {
  name: string
  /** 0-100 */
  level: number
}

export interface SkillCategory {
  title: string
  skills: Skill[]
}

export interface Project {
  id: string
  title: string
  /** 摘要 */
  desc: string
  tech: string[]
  cover: string
  date: string
  demo?: string
  source?: string
  featured?: boolean
  /** 详情（Markdown） */
  content: string
}

export interface Post {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  cover?: string
  /** 外部文章链接：填写后前台卡片直接跳转外站，不再打开站内详情 */
  external?: string
  /** 正文（Markdown 源文） */
  content: string
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  footerText: string
}
