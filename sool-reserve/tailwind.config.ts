import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F4EE",
        charcoal: "#202020",
        gold: "#B69A68",
        "gold-deep": "#8C7346",
        burgundy: "#4C202B",
        beige: "#ECE5D8",
        stone: { 450: "#8A847A" },
        line: "#E2DACB",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif KR"', "serif"],
        kserif: ['"Noto Serif KR"', "serif"],
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em" },
      maxWidth: { site: "1440px" },
    },
  },
  plugins: [],
};
export default config;
