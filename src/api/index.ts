/**
 * 统一 API 层：当前用 localStorage 模拟，全部返回 Promise，
 * 后续切换真实后端时只需替换本文件内的实现。
 */
import type { Post, Profile, Project, SiteSettings, SkillCategory } from '../types'
import { defaultSettings, ensureSeeded, keys, readJSON, writeJSON } from './storage'

ensureSeeded()

function readList<T>(key: string): T[] {
  return readJSON<T[]>(key) ?? []
}

/** 个人信息 */
export const profileApi = {
  async get(): Promise<Profile> {
    return readJSON<Profile>(keys.profile)!
  },
  async update(data: Profile): Promise<void> {
    writeJSON(keys.profile, data)
  },
}

/** 技能（整体保存，前台只读） */
export const skillsApi = {
  async list(): Promise<SkillCategory[]> {
    return readList<SkillCategory>(keys.skills)
  },
  async saveAll(data: SkillCategory[]): Promise<void> {
    writeJSON(keys.skills, data)
  },
}

/** 项目 */
export const projectsApi = {
  /** 精选优先，同组内按日期降序 */
  async list(): Promise<Project[]> {
    return readList<Project>(keys.projects).sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.date.localeCompare(a.date),
    )
  },
  async get(id: string): Promise<Project | undefined> {
    return readList<Project>(keys.projects).find((p) => p.id === id)
  },
  async create(data: Project): Promise<Project> {
    const list = readList<Project>(keys.projects)
    list.push(data)
    writeJSON(keys.projects, list)
    return data
  },
  async update(id: string, data: Project): Promise<void> {
    const list = readList<Project>(keys.projects).map((p) => (p.id === id ? { ...data, id } : p))
    writeJSON(keys.projects, list)
  },
  async remove(id: string): Promise<void> {
    writeJSON(
      keys.projects,
      readList<Project>(keys.projects).filter((p) => p.id !== id),
    )
  },
}

/** 博客文章 */
export const postsApi = {
  async list(): Promise<Post[]> {
    return readList<Post>(keys.posts).sort((a, b) => b.date.localeCompare(a.date))
  },
  async get(slug: string): Promise<Post | undefined> {
    return readList<Post>(keys.posts).find((p) => p.slug === slug)
  },
  async exists(slug: string): Promise<boolean> {
    return readList<Post>(keys.posts).some((p) => p.slug === slug)
  },
  async create(data: Post): Promise<Post> {
    if (await this.exists(data.slug)) throw new Error(`slug "${data.slug}" 已存在`)
    const list = readList<Post>(keys.posts)
    list.push(data)
    writeJSON(keys.posts, list)
    return data
  },
  async update(slug: string, data: Post): Promise<void> {
    const list = readList<Post>(keys.posts).map((p) => (p.slug === slug ? { ...data, slug } : p))
    writeJSON(keys.posts, list)
  },
  async remove(slug: string): Promise<void> {
    writeJSON(
      keys.posts,
      readList<Post>(keys.posts).filter((p) => p.slug !== slug),
    )
  },
}

/** 站点设置 */
export const settingsApi = {
  async get(): Promise<SiteSettings> {
    return readJSON<SiteSettings>(keys.settings) ?? defaultSettings
  },
  async update(data: SiteSettings): Promise<void> {
    writeJSON(keys.settings, data)
  },
}

export { resetAll } from './storage'
export { changePassword, isAuthed, login, logout } from './auth'
