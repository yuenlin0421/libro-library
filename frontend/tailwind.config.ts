import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // 自定義顏色
        "background-dark": "#020617",
        "sidebar-dark": "#0f172a",
        "card-dark": "rgba(30, 41, 59, 0.5)",
        "border-dark": "rgba(255, 255, 255, 0.1)",
        "action-indigo": "#4f46e5",
      },
    },
  },
  plugins: [animate],
};
export default config;
