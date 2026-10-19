import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'

// 按需注册语言，避免全量语言包撑大体积
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('html', xml)

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

export interface TocItem {
  depth: number
  text: string
}

export interface RenderedMarkdown {
  html: string
  toc: TocItem[]
  /** 预计阅读分钟数 */
  readingTime: number
}

/** Markdown 源文 → HTML + 目录 + 阅读时长（前台文章页与后台编辑器共用） */
export function renderMarkdown(content: string): RenderedMarkdown {
  const toc: TocItem[] = []
  marked.walkTokens(marked.lexer(content), (token) => {
    if (token.type === 'heading' && (token.depth === 2 || token.depth === 3)) {
      toc.push({ depth: token.depth, text: token.text })
    }
  })
  const plainText = content.replace(/[#`*>\-[\]()!]/g, '')
  return {
    html: marked.parse(content) as string,
    toc,
    // 中文按约 300 字/分钟估算
    readingTime: Math.max(1, Math.round(plainText.length / 300)),
  }
}
