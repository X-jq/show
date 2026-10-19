import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { isAuthed, login } from '../../api'

const schema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  'w-full rounded-lg border border-white/10 bg-space px-4 py-3 text-mist placeholder:text-mist-dim/50 outline-none transition-colors focus:border-nebula'

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // 已登录直接进后台
  if (isAuthed()) return <Navigate to="/admin" replace />

  const onSubmit = async (values: FormValues) => {
    setError('')
    const ok = await login(values.username, values.password)
    if (ok) {
      navigate('/admin', { replace: true })
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-space-card/80 p-8 backdrop-blur">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-nebula/20 text-xl text-nebula">✦</span>
          <h1 className="text-xl font-bold text-mist">后台管理登录</h1>
          <p className="mt-1 text-sm text-mist-dim">登录后可管理站点内容</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-username" className="mb-1.5 block text-sm text-mist-dim">
              用户名
            </label>
            <input id="login-username" autoComplete="username" placeholder="admin" className={inputClass} {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm text-mist-dim">
              密码
            </label>
            <input id="login-password" type="password" autoComplete="current-password" placeholder="••••••" className={inputClass} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-nebula to-[#9a8cff] px-8 py-3 font-medium text-white shadow-lg shadow-nebula/25 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-mist-dim/70">
          默认账号：admin / admin123（可在「站点设置」中修改密码）
        </p>
      </div>
    </div>
  )
}
