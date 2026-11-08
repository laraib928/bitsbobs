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
        'brand-red': '#E30512',
        'brand-yellow': '#FFEC00',
        'brand-navy': '#312682',
        'navy-deep': '#1D1650',
        ink: '#14112E',
        'text-2': '#3B3956',
        muted: '#5B5A72',
        'soft-on-dark': '#D6D4EE',
        'soft-on-dark-2': '#B9B5E0',
        surface: '#F3F4F8',
        line: '#E2E3EC',
        'field-border': '#C9CAD6',
        success: '#1E7A3E',
        warning: '#A35A00',
        danger: '#B3000E',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1320px',
      },
    },
  },
  plugins: [],
};

export default config;

