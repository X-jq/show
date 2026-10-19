import { useEffect, useState } from 'react'

const links = [
  { id: 'home', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' },
  { id: 'blog', label: '博客' },
  { id: 'contact', label: '联系' },
]

/** 固定顶部导航：滚动毛玻璃、移动端汉堡菜单、当前区块高亮 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 当前区块高亮
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const { id } of links) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-space/70 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <button
          onClick={() => go('home')}
          className="text-lg font-bold tracking-wide text-mist hover:text-nebula transition-colors"
        >
          林星河<span className="text-nebula">.dev</span>
        </button>

        {/* 桌面导航 */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => go(id)}
                className={`text-sm transition-colors ${active === id ? 'text-nebula font-medium' : 'text-mist-dim hover:text-mist'
                  }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* 移动端汉堡按钮 */}
        <button
          className="md:hidden flex h-11 w-11 flex-col items-center justify-center gap-1.5"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
        >
          <span
            className={`h-0.5 w-6 bg-mist transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 bg-mist transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 bg-mist transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {/* 移动端菜单面板 */}
      {open && (
        <ul className="md:hidden border-t border-white/5 bg-space/95 backdrop-blur-md">
          {links.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => go(id)}
                className={`block w-full px-6 py-4 text-left text-base transition-colors ${active === id ? 'text-nebula' : 'text-mist-dim hover:text-mist'
                  }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
