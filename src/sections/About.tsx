import Reveal from '../components/Reveal'
import type { Profile } from '../types'

export default function About({ profile }: { profile: Profile }) {
  const infoCards = [
    { label: '坐标', value: profile.location },
    { label: '经验', value: profile.experience },
    { label: '状态', value: profile.status },
    { label: '学历', value: profile.education },
  ]
  return (
    <section id="about" className="mx-auto max-w-[1200px] px-6 py-24">
      <Reveal>
        <h2 className="mb-2 text-3xl font-bold text-mist md:text-4xl">关于我</h2>
        <div className="mb-12 h-1 w-16 rounded bg-nebula" />
      </Reveal>

      <div className="grid items-start gap-12 md:grid-cols-[280px_1fr]">
        {/* 头像 */}
        <Reveal className="mx-auto md:mx-0">
          <div className="relative h-64 w-64">
            <div className="absolute inset-0 rounded-full bg-nebula/30 blur-2xl" aria-hidden="true" />
            <img
              src={profile.avatar}
              alt={`${profile.name}的头像`}
              loading="lazy"
              className="relative h-64 w-64 rounded-full border-2 border-nebula/40 object-cover"
            />
          </div>
          <ul className="mt-6 flex justify-center gap-4 md:justify-start">
            {profile.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-mist-dim transition-colors hover:text-starcyan"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <div>
          {/* 简介 */}
          <Reveal>
            {profile.bio.map((line, i) => (
              <p key={i} className="mb-3 text-mist-dim leading-relaxed">
                {line}
              </p>
            ))}
          </Reveal>

          {/* 关键信息卡片 */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {infoCards.map((card, i) => (
              <Reveal key={card.label} delay={i * 80}>
                <div className="rounded-xl border border-white/5 bg-space-card/80 p-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-nebula/40">
                  <p className="text-xs text-mist-dim">{card.label}</p>
                  <p className="mt-1 text-sm font-medium text-mist">{card.value}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 时间线 */}
          <div className="mt-12">
            {profile.timeline.map((item, i) => (
              <Reveal key={item.period} delay={i * 100}>
                <div className="relative border-l-2 border-nebula/30 pb-8 pl-6 last:pb-0">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-nebula shadow-[0_0_10px_rgba(124,108,255,0.8)]" />
                  <p className="text-xs text-starcyan">{item.period}</p>
                  <h3 className="mt-1 font-semibold text-mist">{item.title}</h3>
                  <p className="text-sm text-mist-dim">{item.org}</p>
                  <p className="mt-1 text-sm text-mist-dim">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
