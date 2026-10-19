import { useState, type FormEvent } from 'react'
import Reveal from '../components/Reveal'
import type { Profile } from '../types'

interface FormState {
  name: string
  email: string
  message: string
}

type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.name.trim()) errors.name = '请填写姓名'
  if (!EMAIL_RE.test(form.email)) errors.email = '请填写有效的邮箱地址'
  if (form.message.trim().length < 10) errors.message = '留言内容至少 10 个字'
  return errors
}

export default function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    // v1：通过 mailto 发送，无需自建后端
    const subject = encodeURIComponent(`来自个人网站的留言 - ${form.name}`)
    const body = encodeURIComponent(`姓名：${form.name}\n邮箱：${form.email}\n\n${form.message}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border bg-space-card/80 px-4 py-3 text-mist placeholder:text-mist-dim/50 outline-none transition-colors focus:border-nebula ${hasError ? 'border-red-400/60' : 'border-white/10'
    }`

  return (
    <section id="contact" className="mx-auto max-w-[1200px] px-6 py-24">
      <Reveal>
        <h2 className="mb-2 text-3xl font-bold text-mist md:text-4xl">联系我</h2>
        <div className="mb-12 h-1 w-16 rounded bg-nebula" />
      </Reveal>

      <div className="grid gap-12 md:grid-cols-2">
        {/* 联系方式 */}
        <Reveal>
          <p className="text-mist-dim leading-relaxed">
            无论是工作机会、项目合作，还是单纯想聊聊技术，都欢迎联系我。我通常会在 1-2 个工作日内回复。
          </p>
          <div className="mt-8 space-y-4">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 text-mist transition-colors hover:text-nebula"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-nebula/10 text-nebula">@</span>
              {profile.email}
            </a>
            <div className="flex items-center gap-3 text-mist-dim">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-starcyan/10 text-starcyan">
                ⌖
              </span>
              {profile.location}
            </div>
          </div>
          <ul className="mt-8 flex gap-4">
            {profile.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-mist-dim transition-colors hover:border-starcyan/50 hover:text-starcyan"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* 表单 */}
        <Reveal delay={100}>
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-starcyan/30 bg-space-card/80 p-10 text-center">
              <p className="text-lg font-semibold text-starcyan">邮件客户端已打开</p>
              <p className="mt-2 text-sm text-mist-dim">
                请在邮件客户端中完成发送。如果没有弹出，也可以直接发邮件到 {profile.email}
              </p>
              <button
                onClick={() => {
                  setSent(false)
                  setForm({ name: '', email: '', message: '' })
                }}
                className="mt-6 text-sm text-nebula hover:underline"
              >
                再写一封
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-sm text-mist-dim">
                  姓名
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="你的称呼"
                  className={inputClass(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm text-mist-dim">
                  邮箱
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className={inputClass(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-sm text-mist-dim">
                  留言
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="想说的话…"
                  rows={5}
                  className={`${inputClass(errors.message)} resize-none`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-nebula to-[#9a8cff] px-8 py-3 font-medium text-white shadow-lg shadow-nebula/25 transition-transform hover:scale-[1.02] active:scale-95"
              >
                发送留言
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
