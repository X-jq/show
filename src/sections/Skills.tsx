import Reveal from '../components/Reveal'
import type { SkillCategory } from '../types'

export default function Skills({ categories }: { categories: SkillCategory[] }) {
  return (
    <section id="skills" className="mx-auto max-w-[1200px] px-6 py-24">
      <Reveal>
        <h2 className="mb-2 text-3xl font-bold text-mist md:text-4xl">技能</h2>
        <div className="mb-12 h-1 w-16 rounded bg-nebula" />
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, ci) => (
          <Reveal key={category.title} delay={ci * 100}>
            <div className="h-full rounded-xl border border-white/5 bg-space-card/80 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-nebula/40">
              <h3 className="mb-5 flex items-center gap-2 font-semibold text-mist">
                <span className="h-2 w-2 rounded-full bg-starcyan" aria-hidden="true" />
                {category.title}
              </h3>
              <ul className="space-y-4">
                {category.skills.map((skill) => (
                  <li key={skill.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-mist">{skill.name}</span>
                      <span className="text-xs text-mist-dim">{skill.level}%</span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} 熟练度`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-nebula to-starcyan"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
