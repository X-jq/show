import type { SiteSettings } from '../types'
import { profile } from '../data/profile'
import { skillCategories } from '../data/skills'
import { projects } from '../data/projects'
import { postSeeds } from '../lib/posts'

/** localStorage 命名空间与 key 定义 */
const NS = 'portfolio'

export const keys = {
  profile: `${NS}:profile`,
  skills: `${NS}:skills`,
  projects: `${NS}:projects`,
  posts: `${NS}:posts`,
  settings: `${NS}:settings`,
  auth: `${NS}:auth`,
  pwdhash: `${NS}:pwdhash`,
  seeded: `${NS}:seeded`,
} as const

export const defaultSettings: SiteSettings = {
  siteName: '林珊珊 · 个人作品集',
  siteDescription: '全栈工程师，专注 React 与现代化 Web 体验',
  footerText: '用 React 与星光构建',
}

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** 首次访问时把内置种子数据写入 localStorage */
export function ensureSeeded(): void {
  if (localStorage.getItem(keys.seeded)) return
  if (!readJSON(keys.profile)) writeJSON(keys.profile, profile)
  if (!readJSON(keys.skills)) writeJSON(keys.skills, skillCategories)
  if (!readJSON(keys.projects)) writeJSON(keys.projects, projects)
  if (!readJSON(keys.posts)) writeJSON(keys.posts, postSeeds)
  if (!readJSON(keys.settings)) writeJSON(keys.settings, defaultSettings)
  localStorage.setItem(keys.seeded, '1')
}

/** 重置全部数据（危险操作） */
export function resetAll(): void {
  Object.values(keys).forEach((k) => localStorage.removeItem(k))
}
