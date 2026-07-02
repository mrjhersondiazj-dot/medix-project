/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        medix: {
          primary: "#0F766E",
          secondary: "#0369A1",
          background: "#F8FAFC",
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
    },
  },

  plugins: [],
}
