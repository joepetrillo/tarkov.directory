import { type Config } from "tailwindcss";
import { radixThemePreset } from "radix-themes-tw";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bender", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        xs: "320px",
      },
    },
  },
  presets: [radixThemePreset],
};
export default config;
