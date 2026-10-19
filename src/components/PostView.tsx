import { useEffect, useMemo, useRef, useState } from 'react'
import { renderMarkdown } from '../lib/markdown'
import type { Post } from '../types'

interface PostViewProps {
  post: Post
  prev: Post | null
  next: Post | null
  onClose: () => void
  onNavigate: (slug: string) => void
}

/** 文章详情全屏视图：Markdown 渲染 + 目录导航 + 上一篇/下一篇 */
export default function PostView({ post, prev, next, onClose, onNavigate }: PostViewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentHeading, setCurrentHeading] = useState('')

  // 运行时渲染 Markdown：HTML + 目录 + 阅读时长
  const { html, toc, readingTime } = useMemo(() => renderMarkdown(post.content), [post.content])

  // 切换文章时回到顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setCurrentHeading('')
  }, [post.slug])

  // 目录点击：按标题文本定位（无需依赖渲染器生成 id）
  const scrollToHeading = (text: string) => {
    const headings = contentRef.current?.querySelectorAll('h2, h3')
    if (!headings) return
    for (const h of headings) {
      if (h.textContent?.trim() === text) {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  // 滚动时高亮当前标题
  useEffect(() => {
    const container = scrollRef.current
    const content = contentRef.current
    if (!container || !content) return
    const onScroll = () => {
      const headings = Array.from(content.querySelectorAll('h2, h3'))
      const current = headings
        .filter((h) => (h as HTMLElement).offsetTop <= container.scrollTop + 120)
        .pop()
      setCurrentHeading(current?.textContent?.trim() ?? '')
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [post.slug])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-space/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={post.title}>
      {/* 顶栏 */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-mist-dim transition-colors hover:text-mist"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
        <div className="flex items-center gap-3 text-xs text-mist-dim">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1100px] gap-10 px-6 py-10">
          {/* 正文 */}
          <article className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-snug text-mist md:text-4xl">{post.title}</h1>
            <ul className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded bg-starcyan/10 px-2 py-0.5 text-xs text-starcyan">
                  {tag}
                </li>
              ))}
            </ul>
            <div
              ref={contentRef}
              className="post-content mt-8"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* 上一篇 / 下一篇 */}
            <nav className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
              {prev ? (
                <button
                  onClick={() => onNavigate(prev.slug)}
                  className="rounded-xl border border-white/5 bg-space-card/80 p-4 text-left transition-colors hover:border-nebula/40"
                >
                  <span className="text-xs text-mist-dim">← 上一篇</span>
                  <p className="mt-1 text-sm font-medium text-mist">{prev.title}</p>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button
                  onClick={() => onNavigate(next.slug)}
                  className="rounded-xl border border-white/5 bg-space-card/80 p-4 text-right transition-colors hover:border-nebula/40"
                >
                  <span className="text-xs text-mist-dim">下一篇 →</span>
                  <p className="mt-1 text-sm font-medium text-mist">{next.title}</p>
                </button>
              )}
            </nav>
          </article>

          {/* 目录（桌面端侧栏） */}
          {toc.length > 0 && (
            <aside className="sticky top-10 hidden h-fit w-56 shrink-0 lg:block">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mist-dim">目录</p>
              <ul className="space-y-2 border-l border-white/10 text-sm">
                {toc.map((item, i) => (
                  <li key={i} className={item.depth === 3 ? 'pl-4' : ''}>
                    <button
                      onClick={() => scrollToHeading(item.text)}
                      className={`-ml-px block border-l-2 pl-3 text-left transition-colors ${currentHeading === item.text
                        ? 'border-nebula text-nebula'
                        : 'border-transparent text-mist-dim hover:text-mist'
                        }`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
