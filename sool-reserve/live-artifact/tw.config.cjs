module.exports = {
    content: [__dirname + "/app*.js", __dirname + "/head.html"],
    safelist: ["md:col-span-1", "md:col-span-2", "md:col-span-3", "md:col-span-4"],
    theme: {
      extend: {
        colors: { ivory: "#F7F4EE", charcoal: "#202020", gold: "#B69A68", "gold-deep": "#8C7346", burgundy: "#4C202B", beige: "#ECE5D8", line: "#E2DACB" },
        fontFamily: {
          serif: ['"Cormorant Garamond"', '"Noto Serif KR"', "serif"],
          kserif: ['"Noto Serif KR"', "serif"],
          sans: ['"Noto Sans KR"', "-apple-system", "system-ui", "sans-serif"],
        },
        letterSpacing: { luxe: "0.28em" },
        maxWidth: { site: "1440px" },
      },
    },
  };
