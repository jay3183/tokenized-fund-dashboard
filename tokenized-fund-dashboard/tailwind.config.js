/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00205B', // Updated Franklin Templeton primary blue
        'primary-light': '#1e3a8a',
        'gold-500': '#f4b400',
        accent: '#00A3E0',  // Franklin Templeton accent blue
        managerBadge: '#E6F4EA', // Manager badge background
        investorBadge: '#E3F2FD', // Investor badge background
        adminBadge: '#F3E5F5',   // Admin badge background
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      fontFamily: {
        helvetica: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 