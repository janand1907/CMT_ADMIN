/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Sampled directly from the Connect My Tours logo mark (navy + bright blue ribbon).
        // Single blue scale used for all brand accents, headings, and CTAs.
        primary: {
          50: "#eaf1fb",
          100: "#d3e3f6",
          200: "#a8c8ed",
          300: "#6fa3de",
          400: "#3a7fce",
          500: "#1279d1",
          600: "#0d5aa3",
          700: "#0a3f7a",
          800: "#062a54",
          900: "#00205a",
        },
        neutral: {
          25: "#fbfaf9",
          50: "#f7f5f3",
          100: "#eeebe7",
        },
        // Orange accent scale used for secondary CTAs and highlights.
        secondary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 32, 90, 0.12)",
        card: "0 8px 30px -4px rgba(0, 32, 90, 0.15)",
        modal: "0 24px 60px -12px rgba(0, 32, 90, 0.35)",
      },
      keyframes: {
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "modal-in": "modal-in 0.3s ease-out",
        "overlay-in": "overlay-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
