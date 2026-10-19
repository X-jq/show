import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { projectsApi } from '../../api'
import MarkdownEditor from '../components/MarkdownEditor'
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '../components/ui'

const schema = z.object({
  title: z.string().min(1, '请填写标题'),
  desc: z.string().min(1, '请填写摘要'),
  tech: z.string().min(1, '请填写技术栈（逗号分隔）'),
  cover: z.string().url('请填写有效的封面 URL'),
  date: z.string().min(1, '请填写日期'),
  demo: z.string().url('请填写有效 URL').or(z.literal('')),
  source: z.string().url('请填写有效 URL').or(z.literal('')),
  featured: z.boolean(),
  content: z.string().min(1, '请填写项目详情'),
})

type FormValues = z.infer<typeof schema>

/** 项目新建 / 编辑共用页 */
export default function ProjectEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [notFound, setNotFound] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      desc: '',
      tech: '',
      cover: '',
      date: new Date().toISOString().slice(0, 10),
      demo: '',
      source: '',
      featured: false,
      content: '',
    },
  })

  useEffect(() => {
    if (isNew) return
    projectsApi.get(id).then((p) => {
      if (!p) {
        setNotFound(true)
        return
      }
      reset({
        title: p.title,
        desc: p.desc,
        tech: p.tech.join(', '),
        cover: p.cover,
        date: p.date,
        demo: p.demo ?? '',
        source: p.source ?? '',
        featured: p.featured ?? false,
        content: p.content,
      })
    })
  }, [id, isNew, reset])

  const onSubmit = async (v: FormValues) => {
    const project = {
      id: id ?? crypto.randomUUID(),
      title: v.title,
      desc: v.desc,
      tech: v.tech.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      cover: v.cover,
      date: v.date,
      demo: v.demo || undefined,
      source: v.source || undefined,
      featured: v.featured,
      content: v.content,
    }
    if (isNew) {
      await projectsApi.create(project)
    } else {
      await projectsApi.update(id, project)
    }
    navigate('/admin/projects')
  }

  if (notFound) return <p className="text-sm text-mist-dim">项目不存在。</p>

  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-red-400">{msg}</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-mist">{isNew ? '新建项目' : '编辑项目'}</h2>
        <button type="button" className={btnSecondary} onClick={() => navigate('/admin/projects')}>
          返回列表
        </button>
      </div>

      <section className={`${cardClass} space-y-5`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>标题 *</label>
            <input className={inputClass} {...register('title')} />
            {err(errors.title?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>摘要 *</label>
            <textarea rows={2} className={`${inputClass} resize-y`} {...register('desc')} />
            {err(errors.desc?.message)}
          </div>
          <div>
            <label className={labelClass}>技术栈（逗号分隔）*</label>
            <input className={inputClass} placeholder="React, TypeScript" {...register('tech')} />
            {err(errors.tech?.message)}
          </div>
          <div>
            <label className={labelClass}>日期 *</label>
            <input type="date" className={inputClass} {...register('date')} />
            {err(errors.date?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>封面 URL *</label>
            <input className={inputClass} {...register('cover')} />
            {err(errors.cover?.message)}
          </div>
          <div>
            <label className={labelClass}>Demo 链接</label>
            <input className={inputClass} placeholder="https://…" {...register('demo')} />
            {err(errors.demo?.message)}
          </div>
          <div>
            <label className={labelClass}>源码链接</label>
            <input className={inputClass} placeholder="https://github.com/…" {...register('source')} />
            {err(errors.source?.message)}
          </div>
          <label className="flex items-center gap-2 text-sm text-mist-dim">
            <input type="checkbox" className="h-4 w-4 accent-nebula" {...register('featured')} />
            设为精选（前台置顶）
          </label>
        </div>
      </section>

      <section className={`${cardClass} space-y-3`}>
        <label className={labelClass}>项目详情（Markdown）*</label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} />}
        />
        {err(errors.content?.message)}
      </section>

      <button type="submit" disabled={isSubmitting} className={btnPrimary}>
        {isSubmitting ? '保存中…' : isNew ? '创建项目' : '保存修改'}
      </button>
    </form>
  )
}
