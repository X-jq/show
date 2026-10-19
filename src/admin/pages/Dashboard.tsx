import { Link } from 'react-router-dom'
import { postsApi, projectsApi, skillsApi } from '../../api'
import { useData } from '../../hooks/useData'
import { cardClass } from '../components/ui'

export default function Dashboard() {
  const projects = useData(projectsApi.list)
  const posts = useData(postsApi.list)
  const skills = useData(skillsApi.list)

  const stats = [
    { label: '项目数量', value: projects?.length, to: '/admin/projects' },
    { label: '博客文章', value: posts?.length, to: '/admin/posts' },
    { label: '技能分类', value: skills?.length, to: '/admin/skills' },
    { label: '技能总数', value: skills?.reduce((sum, c) => sum + c.skills.length, 0), to: '/admin/skills' },
  ]

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${cardClass} transition-all hover:-translate-y-1 hover:border-nebula/40`}>
            <p className="text-sm text-mist-dim">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-mist">{s.value ?? '—'}</p>
          </Link>
        ))}
      </div>

      {/* 最近文章 */}
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-mist">最近文章</h2>
          <Link to="/admin/posts/new" className="text-sm text-nebula hover:underline">
            + 写新文章
          </Link>
        </div>
        {posts && posts.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {posts.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link to={`/admin/posts/${p.slug}`} className="group flex items-center justify-between gap-4 py-3">
                  <span className="truncate text-sm text-mist transition-colors group-hover:text-nebula">{p.title}</span>
                  <span className="shrink-0 text-xs text-mist-dim">{p.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-mist-dim">暂无文章</p>
        )}
      </section>
    </div>
  )
}
