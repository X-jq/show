import { useMemo, useState } from 'react'
import { renderMarkdown } from '../../lib/markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

/** Markdown 编辑器：桌面端左右分栏实时预览，移动端 tab 切换 */
export default function MarkdownEditor({ value, onChange, rows = 18 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const html = useMemo(() => renderMarkdown(value).html, [value])

  const textarea = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder="支持 Markdown 语法…"
      className="w-full resize-y rounded-lg border border-white/10 bg-space-card/80 p-4 font-mono text-sm text-mist placeholder:text-mist-dim/50 outline-none transition-colors focus:border-nebula"
    />
  )

  const preview = (
    <div className="min-h-[200px] w-full rounded-lg border border-white/10 bg-space-card/50 p-4">
      {value.trim() ? (
        <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-sm text-mist-dim/60">暂无内容，预览将在这里显示</p>
      )}
    </div>
  )

  return (
    <div>
      {/* 移动端 tab */}
      <div className="mb-2 flex gap-2 lg:hidden">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1 text-xs transition-colors ${
              tab === t ? 'bg-nebula/20 text-nebula' : 'text-mist-dim hover:text-mist'
            }`}
          >
            {t === 'edit' ? '编辑' : '预览'}
          </button>
        ))}
      </div>

      {/* 桌面端左右分栏 */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        {textarea}
        {preview}
      </div>

      {/* 移动端单栏切换 */}
      <div className="lg:hidden">{tab === 'edit' ? textarea : preview}</div>
    </div>
  )
}
