import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../api'

const NAV_ITEMS = [
  { to: '/admin', label: '仪表盘', end: true },
  { to: '/admin/profile', label: '个人信息' },
  { to: '/admin/skills', label: '技能管理' },
  { to: '/admin/projects', label: '项目管理' },
  { to: '/admin/posts', label: '博客管理' },
  { to: '/admin/settings', label: '站点设置' },
]

/** 后台独立布局：侧边栏 + 顶栏，不复用前台 Navbar */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentTitle =
    [...NAV_ITEMS]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))
      ?.label ?? '后台管理'

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm transition-colors ${
      isActive ? 'bg-nebula/15 font-medium text-nebula' : 'text-mist-dim hover:bg-white/5 hover:text-mist'
    }`

  return (
    <div className="flex min-h-screen bg-space text-mist">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-white/5 bg-space-card/95 p-4 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavLink to="/admin" className="mb-6 flex items-center gap-2 px-2" onClick={() => setSidebarOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nebula/20 text-nebula">✦</span>
          <span className="font-semibold">站点后台</span>
        </NavLink>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-space/80 px-6 py-4 backdrop-blur">
          <button
            className="rounded-lg p-1.5 text-mist-dim hover:bg-white/5 hover:text-mist lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开菜单"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{currentTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/" target="_blank" className="text-sm text-mist-dim transition-colors hover:text-mist">
              查看前台 ↗
            </NavLink>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-mist-dim transition-colors hover:border-red-400/50 hover:text-red-400"
            >
              退出登录
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
