import { useEffect, useState } from 'react'
import { z } from 'zod'
import { skillsApi } from '../../api'
import type { SkillCategory } from '../../types'
import ConfirmDialog from '../components/ConfirmDialog'
import { btnPrimary, btnSecondary, cardClass, inputClass } from '../components/ui'

/** 提交前整体校验 */
const schema = z.array(
  z.object({
    title: z.string().min(1),
    skills: z.array(z.object({ name: z.string().min(1), level: z.number().min(0).max(100) })),
  }),
)

/** 技能管理：受控编辑整个分类数组，一次性保存 */
export default function SkillsAdmin() {
  const [categories, setCategories] = useState<SkillCategory[] | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    skillsApi.list().then(setCategories)
  }, [])

  if (!categories) return <p className="text-sm text-mist-dim">加载中…</p>

  const updateCategory = (ci: number, patch: Partial<SkillCategory>) =>
    setCategories((list) => list!.map((c, i) => (i === ci ? { ...c, ...patch } : c)))

  const updateSkill = (ci: number, si: number, patch: Partial<{ name: string; level: number }>) =>
    setCategories((list) =>
      list!.map((c, i) =>
        i === ci ? { ...c, skills: c.skills.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : c,
      ),
    )

  const onSave = async () => {
    const result = schema.safeParse(categories)
    if (!result.success) {
      setError('请检查：分类标题与技能名称不能为空，熟练度需在 0-100 之间')
      return
    }
    setError('')
    await skillsApi.saveAll(categories)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist-dim">编辑技能分类与熟练度（0-100），保存后前台即时生效。</p>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => setCategories((list) => [...list!, { title: '', skills: [] }])}
        >
          + 新增分类
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}

      {categories.map((category, ci) => (
        <section key={ci} className={`${cardClass} space-y-4`}>
          <div className="flex items-center gap-3">
            <input
              className={`${inputClass} w-48 font-medium`}
              placeholder="分类名称"
              value={category.title}
              onChange={(e) => updateCategory(ci, { title: e.target.value })}
            />
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() =>
                  updateCategory(ci, { skills: [...category.skills, { name: '', level: 50 }] })
                }
              >
                + 技能
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-mist-dim hover:bg-red-500/10 hover:text-red-400"
                onClick={() => setDeleteIndex(ci)}
                aria-label="删除分类"
              >
                ✕
              </button>
            </div>
          </div>

          {category.skills.length === 0 && <p className="text-sm text-mist-dim/60">暂无技能，点击「+ 技能」添加</p>}
          {category.skills.map((skill, si) => (
            <div key={si} className="flex items-center gap-4">
              <input
                className={`${inputClass} w-44`}
                placeholder="技能名称"
                value={skill.name}
                onChange={(e) => updateSkill(ci, si, { name: e.target.value })}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={skill.level}
                onChange={(e) => updateSkill(ci, si, { level: Number(e.target.value) })}
                className="flex-1 accent-nebula"
                aria-label={`${skill.name || '技能'} 熟练度`}
              />
              <span className="w-12 text-right text-sm text-mist-dim">{skill.level}%</span>
              <button
                type="button"
                className="rounded-lg p-2 text-mist-dim hover:bg-red-500/10 hover:text-red-400"
                onClick={() => updateCategory(ci, { skills: category.skills.filter((_, j) => j !== si) })}
                aria-label="删除技能"
              >
                ✕
              </button>
            </div>
          ))}
        </section>
      ))}

      <div className="flex items-center gap-4">
        <button type="button" className={btnPrimary} onClick={onSave}>
          保存全部
        </button>
        {saved && <span className="text-sm text-starcyan">已保存 ✓</span>}
      </div>

      {deleteIndex !== null && (
        <ConfirmDialog
          title="删除技能分类"
          message={`确定删除分类「${categories[deleteIndex]?.title || '未命名'}」及其下所有技能吗？此操作不可恢复。`}
          onCancel={() => setDeleteIndex(null)}
          onConfirm={() => {
            setCategories((list) => list!.filter((_, i) => i !== deleteIndex))
            setDeleteIndex(null)
          }}
        />
      )}
    </div>
  )
}
