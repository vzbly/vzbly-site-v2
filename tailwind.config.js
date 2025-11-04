/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        whimsical: {
          pink: '#FFB6C1',      // Light Pink
          rose: '#FF69B4',      // Hot Pink
          purple: '#9370DB',    // Medium Slate Blue
          lavender: '#E6E6FA',  // Lavender
          yellow: '#FFD700',    // Gold
          orange: '#FFA500',    // Orange
          coral: '#FF7F50',     // Coral
          mint: '#98FB98',      // Pale Green
          sky: '#87CEEB',       // Sky Blue
          peach: '#FFDAB9',     // Peach Puff
        },
      },
    },
  },
  plugins: [],
};
