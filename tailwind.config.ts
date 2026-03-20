import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'jd-blue': '#1B365D',
        'jd-gold': '#C5A55A',
        'jd-navy': '#0F2240',
        'jd-light': '#F5F7FA',
        'jd-accent': '#2563EB',
      },
    },
  },
  plugins: [],
}
export default config
