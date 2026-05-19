/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Surfaces
        cream:      '#f5f1ea',
        'cream-soft': '#faf7f1',

        // Lime accent
        lime: {
          DEFAULT: '#d4f04a',
          dark:    '#b8d837',
          soft:    '#eaf69d',
        },

        // Ink (text + borders)
        ink: {
          DEFAULT: '#1a1a1a',
          muted:   '#6b6b6b',
          faint:   '#a8a8a8',
          line:    '#e8e3d8',
        },

        // Risk
        risk: {
          low:  '#86c34c',
          med:  '#f4a93a',
          high: '#e85a4f',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
