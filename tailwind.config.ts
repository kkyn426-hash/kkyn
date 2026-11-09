import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#14213d", accent: "#3369e7", canvas: "#f6f8fc" } } },
  plugins: [],
} satisfies Config;
