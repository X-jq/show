import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { postsApi } from '../../api'
import MarkdownEditor from '../components/MarkdownEditor'
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '../components/ui'

const schema = z
  .object({
    title: z.string().min(1, '请填写标题'),
    slug: z
      .string()
      .min(1, '请填写 slug')
      .regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
    date: z.string().min(1, '请填写日期'),
    tags: z.string().min(1, '请填写标签（逗号分隔）'),
    excerpt: z.string().min(1, '请填写摘要'),
    cover: z.string().url('请填写有效 URL').or(z.literal('')),
    external: z.string().url('请填写有效 URL').or(z.literal('')),
    content: z.string(),
  })
  .superRefine((v, ctx) => {
    // 填写外链后正文可留空
    if (!v.external && !v.content.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['content'], message: '请填写正文（或填写外链跳转地址）' })
    }
  })

type FormValues = z.infer<typeof schema>

/** 文章新建 / 编辑共用页（slug 创建后不可修改） */
export default function PostEdit() {
  const { slug } = useParams()
  const isNew = !slug
  const navigate = useNavigate()
  const [notFound, setNotFound] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      date: new Date().toISOString().slice(0, 10),
      tags: '',
      excerpt: '',
      cover: '',
      external: '',
      content: '',
    },
  })

  useEffect(() => {
    if (isNew) return
    postsApi.get(slug).then((p) => {
      if (!p) {
        setNotFound(true)
        return
      }
      reset({
        title: p.title,
        slug: p.slug,
        date: p.date,
        tags: p.tags.join(', '),
        excerpt: p.excerpt,
        cover: p.cover ?? '',
        external: p.external ?? '',
        content: p.content,
      })
    })
  }, [slug, isNew, reset])

  const onSubmit = async (v: FormValues) => {
    if (isNew && (await postsApi.exists(v.slug))) {
      setError('slug', { message: '该 slug 已存在，请更换' })
      return
    }
    const post = {
      slug: v.slug,
      title: v.title,
      date: v.date,
      tags: v.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      excerpt: v.excerpt,
      cover: v.cover || undefined,
      external: v.external || undefined,
      content: v.content,
    }
    if (isNew) {
      await postsApi.create(post)
    } else {
      await postsApi.update(slug, post)
    }
    navigate('/admin/posts')
  }

  if (notFound) return <p className="text-sm text-mist-dim">文章不存在。</p>

  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-red-400">{msg}</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-mist">{isNew ? '写新文章' : '编辑文章'}</h2>
        <button type="button" className={btnSecondary} onClick={() => navigate('/admin/posts')}>
          返回列表
        </button>
      </div>

      <section className={`${cardClass} space-y-5`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>标题 *</label>
            <input className={inputClass} {...register('title')} />
            {err(errors.title?.message)}
          </div>
          <div>
            <label className={labelClass}>Slug（URL 标识，创建后不可改）*</label>
            <input className={inputClass} placeholder="my-first-post" disabled={!isNew} {...register('slug')} />
            {err(errors.slug?.message)}
          </div>
          <div>
            <label className={labelClass}>日期 *</label>
            <input type="date" className={inputClass} {...register('date')} />
            {err(errors.date?.message)}
          </div>
          <div>
            <label className={labelClass}>标签（逗号分隔）*</label>
            <input className={inputClass} placeholder="React, 前端" {...register('tags')} />
            {err(errors.tags?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>封面 URL</label>
            <input className={inputClass} placeholder="留空则不显示封面" {...register('cover')} />
            {err(errors.cover?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>外部链接（文章发布在其他网站时填写，前台点击直接跳转）</label>
            <input className={inputClass} placeholder="https://juejin.cn/post/…，留空则为站内文章" {...register('external')} />
            {err(errors.external?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>摘要 *</label>
            <textarea rows={2} className={`${inputClass} resize-y`} {...register('excerpt')} />
            {err(errors.excerpt?.message)}
          </div>
        </div>
      </section>

      <section className={`${cardClass} space-y-3`}>
        <label className={labelClass}>正文（Markdown，填写外链后可留空）*</label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} rows={24} />}
        />
        {err(errors.content?.message)}
      </section>

      <button type="submit" disabled={isSubmitting} className={btnPrimary}>
        {isSubmitting ? '保存中…' : isNew ? '发布文章' : '保存修改'}
      </button>
    </form>
  )
}
