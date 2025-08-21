import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f8fafc', // light mode background
          dark: '#1e293b', // dark mode background
        },
        accent: {
          DEFAULT: '#22c55e', // green-500
          dark: '#16a34a', // green-600
        },
      },
    },
  },
  plugins: [],
}
export default config
