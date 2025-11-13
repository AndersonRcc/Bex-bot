import type { Config } from 'tailwindcss'

const config: Config = {
  // 👇 CRÍTICO: Habilitar modo oscuro por clase CSS
  darkMode: 'class',
  
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 👇 AHORA USAN VARIABLES CSS DINÁMICAS
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
          card: 'var(--background-secondary)',
          hover: 'var(--background-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          highlight: 'var(--text-primary)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          warning: '#F59E0B',
          error: 'var(--accent-error)',
        },
        borders: {
          default: 'var(--borders-default)',
          subtle: 'var(--borders-default)',
        },
        charts: {
          line: '#22D3EE',
          bar: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.3)',
        'md': '0 4px 6px rgba(0,0,0,0.35)',
        'lg': '0 10px 15px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config