/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        reva: {
          orange: "#F37021"
        }
      }
    }
  },
  plugins: []
};

