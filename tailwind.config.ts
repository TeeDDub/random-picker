import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Nintendo 2001 console-chrome palette
        brand: '#e60012',
        signal: { DEFAULT: '#f68d1f', shadow: '#c76a14' },
        navgold: '#e48600',
        canvas: '#7a8aba',
        canvassoft: '#9fbee7',
        lavender: '#acace7',
        periwinkle: '#8ba1d4',
        chromeindigo: '#3d4f97',
        mutedindigo: '#60619c',
        platinum: '#dedede',
        carbon: { DEFAULT: '#21242e', shadow: '#0d0e13' },
        hairline: '#5a5f8c',
        ink: '#21242e',
        inksoft: '#3d4f97',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config

