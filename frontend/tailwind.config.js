/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif']
      },
      colors: {
        ink: '#1c2922',
        moss: '#246947',
        lime: '#d6eb72',
        canvas: '#f5f6f0'
      }
    }
  },
  plugins: []
};
