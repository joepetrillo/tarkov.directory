import { type Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");
import { radixThemePreset } from "radix-themes-tw";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bender", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "eft-tan": "#9a8866",
        "eft-white": "#c2c2c4",
      },
      screens: {
        xs: "320px",
      },
    },
  },
  presets: [radixThemePreset],
};
export default config;
