import forms from '@tailwindcss/forms'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['12px', '16px'],
        body: ['14px', '20px'],
        section: ['20px', '28px'],
        title: ['28px', '36px'],
      },
      colors: {
        background: '#0D1117',
        surface: '#161B22',
        line: '#21262D',
        primary: '#58A6FF',
        success: '#3FB950',
        danger: '#F85149',
        warning: '#E3B341',
        muted: '#8B949E',
        text: '#E6EDF3',
      },
    },
  },
  plugins: [forms],
} satisfies Config
