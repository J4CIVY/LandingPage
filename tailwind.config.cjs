/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Aquí puedes agregar más personalización si lo necesitas
    },
  },
  plugins: [],
  variants: {
    extend: {
      pointerEvents: ['hover', 'focus', 'group-hover'], // opcional
    },
  },
};
