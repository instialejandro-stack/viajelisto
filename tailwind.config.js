export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#f6f8fb",
        line: "#e6ebf2",
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(24, 39, 75, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
