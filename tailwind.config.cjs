/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'radial-gradient-bl': 'radial-gradient(circle at 0% 100%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
