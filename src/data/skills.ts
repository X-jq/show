import type { SkillCategory } from '../types'

/** 技能数据：level 取值 0-100 */
export const skillCategories: SkillCategory[] = [
  {
    title: '前端',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Tailwind CSS', level: 85 },
      { name: 'Vue', level: 75 },
    ],
  },
  {
    title: '后端',
    skills: [
      { name: 'Node.js', level: 80 },
      { name: 'NestJS', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'GraphQL', level: 65 },
    ],
  },
  {
    title: '数据库',
    skills: [
      { name: 'PostgreSQL', level: 75 },
      { name: 'Redis', level: 70 },
      { name: 'MongoDB', level: 65 },
    ],
  },
  {
    title: '工具链',
    skills: [
      { name: 'Git', level: 85 },
      { name: 'Vite', level: 80 },
      { name: 'Docker', level: 70 },
      { name: 'CI/CD', level: 70 },
    ],
  },
]
