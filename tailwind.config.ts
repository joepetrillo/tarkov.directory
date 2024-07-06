import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bender", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "eft-tan": "#9a8866",
        "eft-white": "#c2c2c4",
      },
    },
  },
  plugins: [],
};
export default config;
