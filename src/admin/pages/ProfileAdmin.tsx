import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { profileApi } from '../../api'
import type { Profile } from '../../types'
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '../components/ui'

const schema = z.object({
  name: z.string().min(1, '请填写姓名'),
  titles: z.string().min(1, '请填写头衔（逗号分隔）'),
  slogan: z.string().min(1, '请填写标语'),
  bio: z.string().min(1, '请填写简介（每行一段）'),
  location: z.string().min(1, '请填写坐标'),
  experience: z.string().min(1, '请填写经验'),
  status: z.string().min(1, '请填写状态'),
  education: z.string().min(1, '请填写学历'),
  email: z.string().email('请填写有效邮箱'),
  avatar: z
    .string()
    .min(1, '请上传头像或填写图片链接')
    .refine(
      (v) => v.startsWith('data:image/') || v.startsWith('/') || /^https?:\/\//.test(v),
      '请上传本地图片或填写有效图片 URL',
    ),
  socials: z.array(z.object({ name: z.string().min(1, '名称必填'), url: z.string().min(1, '链接必填') })),
  timeline: z.array(
    z.object({
      period: z.string().min(1, '时间必填'),
      title: z.string().min(1, '标题必填'),
      org: z.string().min(1, '组织必填'),
      desc: z.string().min(1, '描述必填'),
    }),
  ),
})

type FormValues = z.infer<typeof schema>

/** 本地图片 → 居中裁成方形 → 压缩为 256×256 JPEG data URL（控制体积，适配 localStorage） */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        return reject(new Error('无法处理图片'))
      }
      const min = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, 256, 256)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('图片读取失败'))
    }
    img.src = objectUrl
  })
}

const toForm = (p: Profile): FormValues => ({
  ...p,
  titles: p.titles.join(', '),
  bio: p.bio.join('\n'),
})

const toProfile = (v: FormValues): Profile => ({
  ...v,
  titles: v.titles.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
  bio: v.bio.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
})

export default function ProfileAdmin() {
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const avatar = watch('avatar')

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选择同一张图片
    if (!file) return
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setValue('avatar', dataUrl, { shouldValidate: true })
      setAvatarError('')
    } catch {
      setAvatarError('图片处理失败，请换一张试试')
    }
  }

  const socials = useFieldArray({ control, name: 'socials' })
  const timeline = useFieldArray({ control, name: 'timeline' })

  useEffect(() => {
    profileApi.get().then((p) => reset(toForm(p)))
  }, [reset])

  const onSubmit = async (values: FormValues) => {
    await profileApi.update(toProfile(values))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-red-400">{msg}</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6" noValidate>
      {/* 基本信息 */}
      <section className={`${cardClass} space-y-5`}>
        <h2 className="font-semibold text-mist">基本信息</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>姓名</label>
            <input className={inputClass} {...register('name')} />
            {err(errors.name?.message)}
          </div>
          <div>
            <label className={labelClass}>邮箱</label>
            <input className={inputClass} {...register('email')} />
            {err(errors.email?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>头衔（逗号分隔，Hero 打字机轮播）</label>
            <input className={inputClass} placeholder="全栈工程师, React 开发者" {...register('titles')} />
            {err(errors.titles?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>标语</label>
            <input className={inputClass} {...register('slogan')} />
            {err(errors.slogan?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>简介（每行一段）</label>
            <textarea rows={4} className={`${inputClass} resize-y`} {...register('bio')} />
            {err(errors.bio?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>头像（上传本地图片或填写 URL）</label>
            <div className="flex items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像预览"
                  className="h-16 w-16 shrink-0 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-full border border-dashed border-white/15" />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>
                  上传本地图片
                </button>
                <input className={inputClass} placeholder="或粘贴图片 URL" {...register('avatar')} />
                {err(errors.avatar?.message)}
                {avatarError && <p className="text-xs text-red-400">{avatarError}</p>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            <p className="mt-1.5 text-xs text-mist-dim/60">
              本地图片会自动居中裁剪为方形并压缩后存入浏览器，建议原图不超过 2MB
            </p>
          </div>
          <div>
            <label className={labelClass}>坐标</label>
            <input className={inputClass} {...register('location')} />
            {err(errors.location?.message)}
          </div>
          <div>
            <label className={labelClass}>经验</label>
            <input className={inputClass} {...register('experience')} />
            {err(errors.experience?.message)}
          </div>
          <div>
            <label className={labelClass}>状态</label>
            <input className={inputClass} {...register('status')} />
            {err(errors.status?.message)}
          </div>
          <div>
            <label className={labelClass}>学历</label>
            <input className={inputClass} {...register('education')} />
            {err(errors.education?.message)}
          </div>
        </div>
      </section>

      {/* 社交链接 */}
      <section className={`${cardClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-mist">社交链接</h2>
          <button type="button" className={btnSecondary} onClick={() => socials.append({ name: '', url: '' })}>
            + 添加链接
          </button>
        </div>
        {socials.fields.map((field, i) => (
          <div key={field.id} className="flex items-start gap-3">
            {/* !w-36 覆盖 inputClass 自带的 w-full，否则 flex 布局下链接框会被挤没 */}
            <input className={`${inputClass} !w-36 shrink-0`} placeholder="名称" {...register(`socials.${i}.name`)} />
            <input className={`${inputClass} min-w-0 flex-1`} placeholder="链接 URL" {...register(`socials.${i}.url`)} />
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-mist-dim hover:bg-red-500/10 hover:text-red-400"
              onClick={() => socials.remove(i)}
              aria-label="删除"
            >
              ✕
            </button>
          </div>
        ))}
        {socials.fields.length === 0 && <p className="text-sm text-mist-dim/60">暂无链接</p>}
      </section>

      {/* 经历时间线 */}
      <section className={`${cardClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-mist">经历时间线</h2>
          <button type="button" className={btnSecondary} onClick={() => timeline.append({ period: '', title: '', org: '', desc: '' })}>
            + 添加经历
          </button>
        </div>
        {timeline.fields.map((field, i) => (
          <div key={field.id} className="grid gap-3 rounded-lg border border-white/5 p-4 sm:grid-cols-2">
            <input className={inputClass} placeholder="时间，如 2022 — 至今" {...register(`timeline.${i}.period`)} />
            <input className={inputClass} placeholder="标题，如 高级前端工程师" {...register(`timeline.${i}.title`)} />
            <input className={inputClass} placeholder="组织 / 公司" {...register(`timeline.${i}.org`)} />
            <div className="flex gap-3">
              <input className={`${inputClass} min-w-0 flex-1`} placeholder="描述" {...register(`timeline.${i}.desc`)} />
              <button
                type="button"
                className="shrink-0 rounded-lg p-2 text-mist-dim hover:bg-red-500/10 hover:text-red-400"
                onClick={() => timeline.remove(i)}
                aria-label="删除"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {timeline.fields.length === 0 && <p className="text-sm text-mist-dim/60">暂无经历</p>}
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isSubmitting} className={btnPrimary}>
          {isSubmitting ? '保存中…' : '保存修改'}
        </button>
        {saved && <span className="text-sm text-starcyan">已保存 ✓</span>}
      </div>
    </form>
  )
}
