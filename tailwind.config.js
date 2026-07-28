/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          950: "#120e0b",
          900: "#17130f",
          800: "#241d17",
          700: "#332821",
          600: "#4a3a2e",
          500: "#6b5540",
        },
        clay: {
          400: "#d98f6a",
          500: "#c76a45",
          600: "#b5542f",
        },
        parchment: {
          50: "#fbf8f3",
          100: "#f4ede1",
          200: "#e9dcc7",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(18,14,11,0.08), 0 8px 24px rgba(18,14,11,0.06)",
        cardHover: "0 4px 10px rgba(18,14,11,0.12), 0 16px 36px rgba(18,14,11,0.14)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out both",
        blink: "blink 1s step-start infinite",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
