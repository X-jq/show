import { Navigate } from 'react-router-dom'
import { isAuthed } from '../api'
import type { ReactNode } from 'react'

/** 路由守卫：未登录则跳转到登录页 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthed()) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
