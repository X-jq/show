/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          DEFAULT: '#0B0E1A', // 深空蓝黑 背景主色
          card: '#141A2E', // 卡片/区块底色
        },
        nebula: '#7C6CFF', // 星云紫 主强调色
        starcyan: '#4FD1C5', // 星辰青 次强调色
        starlight: '#FFD166', // 星光黄 点缀色
        mist: {
          DEFAULT: '#E6EAF2', // 文字主色
          dim: '#9AA3B5', // 文字次色
        },
      },
      fontFamily: {
        sans: ['Inter', 'Source Han Sans SC', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
