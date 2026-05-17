import { type Config } from "tailwindcss";
import { radixThemePreset } from "radix-themes-tw";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bender", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      screens: {
        xs: "320px",
      },
    },
  },
  presets: [radixThemePreset],
};
export default config;
