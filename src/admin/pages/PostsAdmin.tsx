import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postsApi } from '../../api'
import type { Post } from '../../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { btnPrimary, cardClass } from '../components/ui'

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)

  const reload = () => postsApi.list().then(setPosts)
  useEffect(() => {
    reload()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist-dim">共 {posts?.length ?? '—'} 篇文章，按日期倒序排列。</p>
        <Link to="/admin/posts/new" className={btnPrimary}>
          + 写新文章
        </Link>
      </div>

      <div className={`${cardClass} overflow-x-auto p-0`}>
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-mist-dim">
              <th className="px-6 py-3 font-medium">标题</th>
              <th className="px-6 py-3 font-medium">标签</th>
              <th className="px-6 py-3 font-medium">日期</th>
              <th className="px-6 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(posts ?? []).map((p) => (
              <tr key={p.slug} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-3">
                  <p className="font-medium text-mist">
                    {p.title}
                    {p.external && <span className="ml-2 rounded bg-starlight/15 px-1.5 py-0.5 text-xs text-starlight">↗ 外链</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-mist-dim">/{p.slug}</p>
                </td>
                <td className="px-6 py-3">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded bg-starcyan/10 px-1.5 py-0.5 text-xs text-starcyan">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3 text-mist-dim">{p.date}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-3">
                    <Link to={`/admin/posts/${p.slug}`} className="text-nebula hover:underline">
                      编辑
                    </Link>
                    <button className="text-red-400 hover:underline" onClick={() => setDeleteTarget(p)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts && posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-mist-dim">
                  暂无文章，点击右上角新建
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="删除文章"
          message={`确定删除文章「${deleteTarget.title}」吗？此操作不可恢复。`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await postsApi.remove(deleteTarget.slug)
            setDeleteTarget(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
