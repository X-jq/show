import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../../api'
import type { Project } from '../../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { btnPrimary, cardClass } from '../components/ui'
import { useEffect } from 'react'

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const reload = () => projectsApi.list().then(setProjects)
  useEffect(() => {
    reload()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist-dim">共 {projects?.length ?? '—'} 个项目，精选项目在前台置顶展示。</p>
        <Link to="/admin/projects/new" className={btnPrimary}>
          + 新建项目
        </Link>
      </div>

      <div className={`${cardClass} overflow-x-auto p-0`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-mist-dim">
              <th className="px-6 py-3 font-medium">项目</th>
              <th className="px-6 py-3 font-medium">技术栈</th>
              <th className="px-6 py-3 font-medium">日期</th>
              <th className="px-6 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(projects ?? []).map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.cover} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" />
                    <div>
                      <p className="font-medium text-mist">
                        {p.title}
                        {p.featured && <span className="ml-2 rounded bg-starlight/15 px-1.5 py-0.5 text-xs text-starlight">★ 精选</span>}
                      </p>
                      <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-mist-dim">{p.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {p.tech.map((t) => (
                      <span key={t} className="rounded bg-starcyan/10 px-1.5 py-0.5 text-xs text-starcyan">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3 text-mist-dim">{p.date}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-3">
                    <Link to={`/admin/projects/${p.id}`} className="text-nebula hover:underline">
                      编辑
                    </Link>
                    <button className="text-red-400 hover:underline" onClick={() => setDeleteTarget(p)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects && projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-mist-dim">
                  暂无项目，点击右上角新建
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="删除项目"
          message={`确定删除项目「${deleteTarget.title}」吗？此操作不可恢复。`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await projectsApi.remove(deleteTarget.id)
            setDeleteTarget(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
