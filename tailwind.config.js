export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        line: "#e2e8f0",
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      boxShadow: {
        soft: "0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04)",
        card: "0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 20px rgba(15, 23, 42, 0.07)",
        "card-hover": "0 4px 12px rgba(15, 23, 42, 0.04), 0 24px 56px rgba(15, 23, 42, 0.13)",
        modal: "0 24px 80px rgba(15, 23, 42, 0.2), 0 4px 16px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 3px rgba(8, 145, 178, 0.18)",
        "glow-sm": "0 0 20px rgba(8, 145, 178, 0.15)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-7px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        float: "float 5s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
