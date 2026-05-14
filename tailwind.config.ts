import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sv-bg':       '#453284',
        'sv-navbar':   '#2B1E59',
        'sv-purple':   '#6A49FA',
        'sv-lavender': '#C4B5FD',
        'sv-pale':     '#E2D9FF',
        'sv-sky':      '#93C8F0',
        'sv-pink':     '#FEDADA',
        'sv-rose':     '#E8A0A0',
        'sv-gold':     '#E8C97A',
        'sv-success':  '#8EE3B5',
        'sv-warning':  '#FFD27D',
        'sv-error':    '#FF8C8C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'btn-primary':     'linear-gradient(135deg, #000000 0%, #E8A0A0 50%, #C4B5FD 100%)',
        'card-lavender':   'linear-gradient(135deg, #E2D9FF, #C4B5FD)',
        'card-purple':     'linear-gradient(135deg, #6A49FA, #453284)',
        'card-pink':       'linear-gradient(135deg, #FEDADA, #E8A0A0)',
      },
    },
  },
  plugins: [],
};

export default config;