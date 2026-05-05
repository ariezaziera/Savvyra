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
        cream: '#FFF9EB',
        sage: '#9FB2AC',
        burgundy: '#5D0D18',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'luxury': 'linear-gradient(135deg, #FFF9EB 0%, #f5ecd4 40%, #e8d5b0 70%, #d4b896 100%)',
      },
    },
  },
  plugins: [],
};
export default config;