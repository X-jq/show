import Navbar from '../components/Navbar'
import StarField from '../components/StarField'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Blog from '../sections/Blog'
import Contact from '../sections/Contact'
import { profileApi, settingsApi, skillsApi } from '../api'
import { useData } from '../hooks/useData'

/** 前台首页：数据统一从 API 层读取 */
export default function HomePage() {
  const profile = useData(profileApi.get)
  const skills = useData(skillsApi.list)
  const settings = useData(settingsApi.get)

  if (!profile || !skills) {
    return (
      <div className="flex min-h-screen items-center justify-center text-mist-dim">
        加载中…
      </div>
    )
  }

  return (
    <>
      <StarField />
      <Navbar />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills categories={skills} />
        <Projects />
        <Blog />
        <Contact profile={profile} />
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-sm text-mist-dim">
        © {new Date().getFullYear()} {profile.name} · {settings?.footerText ?? ''}
      </footer>
    </>
  )
}
