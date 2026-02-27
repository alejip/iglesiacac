/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [
    'translate-x-0',
    'translate-x-full',
    'opacity-0',
    'opacity-100',
    'pointer-events-none',
    'overflow-hidden',
  ],
  theme: {
    extend: {
      colors: {
        'brand-white':  '#ffffff',
        'brand-brown':  '#401c14',
        'brand-red':    '#98211e',
        'brand-orange': '#e8501d',
        'brand-beige':  '#ddd8d0',
        'brand-cream':  '#f4f0e4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to bottom, rgba(64,28,20,0.65) 0%, rgba(64,28,20,0.85) 100%)',
      },
    },
  },
  plugins: [],
};
