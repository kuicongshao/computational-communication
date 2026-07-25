/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "PingFang SC", "Microsoft YaHei", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#07111f",
        panel: "#0b1728",
        line: "#1f365a",
        cyan: "#38bdf8",
        mint: "#34d399",
        violet: "#a78bfa",
        amber: "#f59e0b"
      },
      boxShadow: {
        glow: "0 0 34px rgba(56, 189, 248, .18)"
      }
    }
  },
  plugins: []
};
