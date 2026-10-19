import type { Post } from '../types'

/** 解析 frontmatter（--- 包裹的 key: value 头部） */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { data, body: match[2] }
}

function parseTags(value = ''): string[] {
  return value
    .replace(/[[\]]/g, '')
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/** 从正文提取摘要（第一段纯文本） */
function extractExcerpt(body: string): string {
  const para = body
    .split(/\r?\n\r?\n/)
    .map((p) => p.replace(/[#`*>\-[\]()!]/g, '').trim())
    .find((p) => p.length > 0)
  return para ? para.slice(0, 100) + (para.length > 100 ? '…' : '') : ''
}

// 构建时加载所有 Markdown 文件，作为 localStorage 的初始种子数据
const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const postSeeds: Post[] = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw)
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '',
      tags: parseTags(data.tags),
      excerpt: data.excerpt ?? extractExcerpt(body),
      cover: data.cover,
      content: body.trim(),
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))
