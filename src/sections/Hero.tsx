import { useEffect, useState } from 'react'
import type { Profile } from '../types'

/** 打字机效果 */
function useTypewriter(words: string[], typeSpeed = 130, deleteSpeed = 60, pause = 1600) {
  const [text, setText] = useState('')

  useEffect(() => {
    let word = 0
    let char = 0
    let deleting = false
    let timer = 0

    const step = () => {
      const current = words[word]
      if (!deleting) {
        char++
        setText(current.slice(0, char))
        if (char === current.length) {
          deleting = true
          timer = window.setTimeout(step, pause)
          return
        }
      } else {
        char--
        setText(current.slice(0, char))
        if (char === 0) {
          deleting = false
          word = (word + 1) % words.length
        }
      }
      timer = window.setTimeout(step, deleting ? deleteSpeed : typeSpeed)
    }

    timer = window.setTimeout(step, typeSpeed)
    return () => window.clearTimeout(timer)
  }, [words, typeSpeed, deleteSpeed, pause])

  return text
}

export default function Hero({ profile }: { profile: Profile }) {
  const typed = useTypewriter(profile.titles)

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <p className="mb-4 text-sm tracking-[0.3em] text-starcyan uppercase">Welcome to my universe</p>
      <h1 className="text-4xl font-bold leading-tight text-mist md:text-6xl">
        你好，我是{profile.name}
      </h1>
      <p className="mt-4 h-8 text-xl text-nebula md:text-2xl">
        {typed}
        <span className="ml-1 inline-block w-0.5 animate-pulse bg-nebula align-middle" style={{ height: '1.2em' }} />
      </p>
      <p className="mt-6 max-w-xl text-mist-dim">{profile.slogan}</p>

      <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
        <button
          onClick={() => go('projects')}
          className="rounded-lg bg-gradient-to-r from-nebula to-[#9a8cff] px-8 py-3 font-medium text-white shadow-lg shadow-nebula/25 transition-transform hover:scale-105 active:scale-95"
        >
          查看项目
        </button>
        <button
          onClick={() => go('about')}
          className="rounded-lg border border-starcyan/60 px-8 py-3 font-medium text-starcyan transition-colors hover:bg-starcyan/10"
        >
          了解更多
        </button>
      </div>

      {/* 向下滚动引导 */}
      <button
        onClick={() => go('about')}
        aria-label="向下滚动"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-mist-dim transition-colors hover:text-mist"
      >
        <svg className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7" />
        </svg>
      </button>
    </section>
  )
}
