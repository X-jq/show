import { useEffect, useMemo, useState } from 'react'
import Reveal from '../components/Reveal'
import PostView from '../components/PostView'
import { postsApi } from '../api'
import { useData } from '../hooks/useData'
import { renderMarkdown } from '../lib/markdown'
import type { Post } from '../types'

const ALL = '全部'

/** 阅读时长（分钟），与 PostView 顶栏一致 */
const readingTime = (content: string) => renderMarkdown(content).readingTime

export default function Blog() {
  const posts = useData(postsApi.list) ?? []
  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts])
  const [filter, setFilter] = useState(ALL)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const list = useMemo(
    () => posts.filter((p) => filter === ALL || p.tags.includes(filter)),
    [posts, filter],
  )

  const activeIndex = posts.findIndex((p) => p.slug === activeSlug)
  const active: Post | null = activeIndex >= 0 ? posts[activeIndex] : null
  const prev = activeIndex > 0 ? posts[activeIndex - 1] : null
  const next = activeIndex >= 0 && activeIndex < posts.length - 1 ? posts[activeIndex + 1] : null

  // 打开文章时锁定滚动 + ESC 关闭
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActiveSlug(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <section id="blog" className="mx-auto max-w-[1200px] px-6 py-24">
      <Reveal>
        <h2 className="mb-2 text-3xl font-bold text-mist md:text-4xl">博客</h2>
        <div className="mb-8 h-1 w-16 rounded bg-nebula" />
      </Reveal>

      {/* 标签筛选 */}
      <Reveal className="mb-10 flex flex-wrap gap-3">
        {[ALL, ...allTags].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === tag
              ? 'border-nebula bg-nebula/20 text-nebula'
              : 'border-white/10 text-mist-dim hover:border-nebula/50 hover:text-mist'
              }`}
          >
            {tag}
          </button>
        ))}
      </Reveal>

      {/* 文章列表 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 100}>
            <article
              onClick={() => (post.external ? window.open(post.external, '_blank', 'noreferrer') : setActiveSlug(post.slug))}
              className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-white/5 bg-space-card/80 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-nebula/40 hover:shadow-lg hover:shadow-nebula/10"
            >
              {post.cover && (
                <img
                  src={post.cover}
                  alt={`${post.title} 封面`}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3 text-xs text-mist-dim">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>·</span>
                  {post.external ? (
                    <span className="flex items-center gap-1 text-starlight">
                      外部文章
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  ) : (
                    <span>{readingTime(post.content)} 分钟阅读</span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-mist transition-colors group-hover:text-nebula">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-mist-dim">{post.excerpt}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag} className="rounded bg-starcyan/10 px-2 py-0.5 text-xs text-starcyan">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {active && (
        <PostView
          post={active}
          prev={prev}
          next={next}
          onClose={() => setActiveSlug(null)}
          onNavigate={(slug) => setActiveSlug(slug)}
        />
      )}
    </section>
  )
}
