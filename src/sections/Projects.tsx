import { useEffect, useMemo, useState } from 'react'
import Reveal from '../components/Reveal'
import { projectsApi } from '../api'
import { useData } from '../hooks/useData'
import { renderMarkdown } from '../lib/markdown'
import type { Project } from '../types'

const ALL = '全部'

export default function Projects() {
  const projects = useData(projectsApi.list) ?? []
  const techs = useMemo(() => [ALL, ...Array.from(new Set(projects.flatMap((p) => p.tech)))], [projects])
  const [filter, setFilter] = useState(ALL)
  const [active, setActive] = useState<Project | null>(null)

  // 详情 Markdown 渲染
  const activeHtml = useMemo(() => (active ? renderMarkdown(active.content).html : ''), [active])

  // 精选项目置顶
  const list = useMemo(
    () => projects.filter((p) => filter === ALL || p.tech.includes(filter)),
    [projects, filter],
  )

  // ESC 关闭弹窗 + 打开时锁定滚动
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <section id="projects" className="mx-auto max-w-[1200px] px-6 py-24">
      <Reveal>
        <h2 className="mb-2 text-3xl font-bold text-mist md:text-4xl">项目</h2>
        <div className="mb-8 h-1 w-16 rounded bg-nebula" />
      </Reveal>

      {/* 技术栈筛选 */}
      <Reveal className="mb-10 flex flex-wrap gap-3">
        {techs.map((tech) => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === tech
              ? 'border-nebula bg-nebula/20 text-nebula'
              : 'border-white/10 text-mist-dim hover:border-nebula/50 hover:text-mist'
              }`}
          >
            {tech}
          </button>
        ))}
      </Reveal>

      {/* 项目卡片：PC 3 列 / 平板 2 列 / 手机 1 列 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((project, i) => (
          <Reveal key={project.id} delay={(i % 3) * 100}>
            <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-space-card/80 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-nebula/40 hover:shadow-lg hover:shadow-nebula/10">
              <div className="relative">
                <img
                  src={project.cover}
                  alt={`${project.title} 封面`}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                {project.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-starlight/90 px-3 py-0.5 text-xs font-medium text-space">
                    精选
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-mist">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm text-mist-dim">{project.desc}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li key={t} className="rounded bg-starcyan/10 px-2 py-0.5 text-xs text-starcyan">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <button
                    onClick={() => setActive(project)}
                    className="font-medium text-nebula hover:underline"
                  >
                    查看详情
                  </button>
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noreferrer" className="text-mist-dim hover:text-mist">
                      在线 Demo
                    </a>
                  )}
                  {project.source && (
                    <a href={project.source} target="_blank" rel="noreferrer" className="text-mist-dim hover:text-mist">
                      源码
                    </a>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* 项目详情弹窗 */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} 详情`}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-space-card p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-2xl font-bold text-mist">{active.title}</h3>
              <button
                onClick={() => setActive(null)}
                aria-label="关闭"
                className="rounded-lg p-1 text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img src={active.cover} alt="" className="mb-6 w-full rounded-lg object-cover" />
            <div className="post-content" dangerouslySetInnerHTML={{ __html: activeHtml }} />
            <div className="mt-6 flex gap-4 text-sm">
              {active.demo && (
                <a
                  href={active.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-nebula px-5 py-2 font-medium text-white transition-colors hover:bg-nebula/80"
                >
                  在线 Demo
                </a>
              )}
              {active.source && (
                <a
                  href={active.source}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 px-5 py-2 font-medium text-mist transition-colors hover:bg-white/5"
                >
                  源码
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
