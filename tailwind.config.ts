import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Colores ──────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#f8f7ff',
          100: '#f3f0ff',
          200: '#ede9fe',
          300: '#ddd6fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: {
          DEFAULT: '#16a34a',
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          DEFAULT: '#d97706',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },

      // ── Tipografía ───────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px — badges pequeños
      },

      // ── Espaciado ────────────────────────────────────────────
      spacing: {
        '13': '3.25rem',   // h-13 para botones tipo Trapping
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',     // sidebar width
        '128': '32rem',
      },

      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Sombras ──────────────────────────────────────────────
      boxShadow: {
        'brand':      '0 4px 14px 0 rgba(124, 58, 237, 0.15)',
        'brand-lg':   '0 8px 30px 0 rgba(124, 58, 237, 0.20)',
        'brand-xl':   '0 12px 40px 0 rgba(124, 58, 237, 0.25)',
        'card':       '0 1px 3px 0 rgba(124, 58, 237, 0.06), 0 1px 2px -1px rgba(124, 58, 237, 0.06)',
        'card-hover': '0 4px 12px 0 rgba(124, 58, 237, 0.10)',
        'nav':        '0 -1px 3px 0 rgba(0, 0, 0, 0.05)',
      },

      // ── Animaciones ──────────────────────────────────────────
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.25s ease-out',
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-in':  'slideIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up':  'slideUp 0.3s ease-out',
        'shimmer':   'shimmer 2s infinite linear',
      },

      // ── Breakpoints ──────────────────────────────────────────
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // ── Otros ────────────────────────────────────────────────
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      maxWidth: {
        'app': '1536px',
      },
    },
  },
  plugins: [],
}

export default config
