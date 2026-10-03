import forms from '@tailwindcss/forms'
import type { Config } from 'tailwindcss'

function sf(channel: string): string {
  return `rgb(var(${channel}) / <alpha-value>)`
}

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['12px', '16px'],
        body: ['14px', '20px'],
        section: ['18px', '26px'],
        title: ['26px', '34px'],
      },
      colors: {
        background: sf('--sf-bg'),
        surface: sf('--sf-surface'),
        elevated: sf('--sf-elevated'),
        line: sf('--sf-line'),
        primary: sf('--sf-accent'),
        success: sf('--sf-success'),
        danger: sf('--sf-danger'),
        warning: sf('--sf-warning'),
        muted: sf('--sf-muted'),
        text: sf('--sf-text'),
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.35)',
      },
      keyframes: {
        'sf-fade': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'sf-fade': 'sf-fade 180ms ease-out',
      },
    },
  },
  plugins: [forms],
} satisfies Config
