/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",
        surface: "#111118",
        border: "#1E1E2E",
        indigo1: "#6366F1",
        purple1: "#8B5CF6",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139, 92, 246, 0.25), 0 0 24px rgba(99, 102, 241, 0.22)",
      },
      gradientColorStops: {
        indigo: "var(--tw-gradient-from)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

