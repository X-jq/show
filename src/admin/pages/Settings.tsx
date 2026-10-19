import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { changePassword, resetAll, settingsApi } from '../../api'
import ConfirmDialog from '../components/ConfirmDialog'
import { btnDanger, btnPrimary, cardClass, inputClass, labelClass } from '../components/ui'

const settingsSchema = z.object({
  siteName: z.string().min(1, '请填写站点名称'),
  siteDescription: z.string().min(1, '请填写站点描述'),
  footerText: z.string().min(1, '请填写页脚文案'),
})

const pwdSchema = z
  .object({
    oldPwd: z.string().min(1, '请输入当前密码'),
    newPwd: z.string().min(6, '新密码至少 6 位'),
    confirmPwd: z.string(),
  })
  .refine((v) => v.newPwd === v.confirmPwd, { message: '两次输入的新密码不一致', path: ['confirmPwd'] })

type SettingsValues = z.infer<typeof settingsSchema>
type PwdValues = z.infer<typeof pwdSchema>

export default function Settings() {
  const [savedSettings, setSavedSettings] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [showReset, setShowReset] = useState(false)

  const settingsForm = useForm<SettingsValues>({ resolver: zodResolver(settingsSchema) })
  const pwdForm = useForm<PwdValues>({ resolver: zodResolver(pwdSchema) })

  useEffect(() => {
    settingsApi.get().then((s) => settingsForm.reset(s))
  }, [settingsForm])

  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-red-400">{msg}</p>

  return (
    <div className="max-w-2xl space-y-6">
      {/* 站点设置 */}
      <form
        className={`${cardClass} space-y-5`}
        noValidate
        onSubmit={settingsForm.handleSubmit(async (v) => {
          await settingsApi.update(v)
          setSavedSettings(true)
          setTimeout(() => setSavedSettings(false), 2000)
        })}
      >
        <h2 className="font-semibold text-mist">站点设置</h2>
        <div>
          <label className={labelClass}>站点名称</label>
          <input className={inputClass} {...settingsForm.register('siteName')} />
          {err(settingsForm.formState.errors.siteName?.message)}
        </div>
        <div>
          <label className={labelClass}>站点描述</label>
          <textarea rows={2} className={`${inputClass} resize-y`} {...settingsForm.register('siteDescription')} />
          {err(settingsForm.formState.errors.siteDescription?.message)}
        </div>
        <div>
          <label className={labelClass}>页脚文案</label>
          <input className={inputClass} {...settingsForm.register('footerText')} />
          {err(settingsForm.formState.errors.footerText?.message)}
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" className={btnPrimary}>
            保存设置
          </button>
          {savedSettings && <span className="text-sm text-starcyan">已保存 ✓</span>}
        </div>
      </form>

      {/* 修改密码 */}
      <form
        className={`${cardClass} space-y-5`}
        noValidate
        onSubmit={pwdForm.handleSubmit(async (v) => {
          const ok = await changePassword(v.oldPwd, v.newPwd)
          setPwdMsg(ok ? { ok: true, text: '密码已修改 ✓' } : { ok: false, text: '当前密码不正确' })
          if (ok) pwdForm.reset()
        })}
      >
        <h2 className="font-semibold text-mist">修改密码</h2>
        <div>
          <label className={labelClass}>当前密码</label>
          <input type="password" autoComplete="current-password" className={inputClass} {...pwdForm.register('oldPwd')} />
          {err(pwdForm.formState.errors.oldPwd?.message)}
        </div>
        <div>
          <label className={labelClass}>新密码（至少 6 位）</label>
          <input type="password" autoComplete="new-password" className={inputClass} {...pwdForm.register('newPwd')} />
          {err(pwdForm.formState.errors.newPwd?.message)}
        </div>
        <div>
          <label className={labelClass}>确认新密码</label>
          <input type="password" autoComplete="new-password" className={inputClass} {...pwdForm.register('confirmPwd')} />
          {err(pwdForm.formState.errors.confirmPwd?.message)}
        </div>
        {pwdMsg && (
          <p className={`rounded-lg px-4 py-2 text-sm ${pwdMsg.ok ? 'bg-starcyan/10 text-starcyan' : 'bg-red-500/10 text-red-400'}`}>
            {pwdMsg.text}
          </p>
        )}
        <button type="submit" className={btnPrimary}>
          修改密码
        </button>
      </form>

      {/* 危险区 */}
      <section className="rounded-xl border border-red-400/20 bg-red-500/5 p-6">
        <h2 className="font-semibold text-red-400">危险操作</h2>
        <p className="mt-1 text-sm text-mist-dim">
          重置后所有内容（含密码）将恢复为初始数据，且会退出登录。此操作不可恢复。
        </p>
        <button type="button" className={`${btnDanger} mt-4`} onClick={() => setShowReset(true)}>
          重置全部数据
        </button>
      </section>

      {showReset && (
        <ConfirmDialog
          title="重置全部数据"
          message="确定要清空所有修改并恢复初始数据吗？包含文章、项目、技能、个人信息与密码。此操作不可恢复。"
          confirmText="确认重置"
          onCancel={() => setShowReset(false)}
          onConfirm={() => {
            resetAll()
            location.reload()
          }}
        />
      )}
    </div>
  )
}
