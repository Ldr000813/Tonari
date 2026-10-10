import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7EE",
        ink: "#3f3a33",
        yellow: "#F6C64B",
        teal: "#33A6A0",
        mint: "#EAF6F3",
        mintline: "#CDE9E3",
        line: "#EDE4D2",
      },
    },
  },
  plugins: [],
};
export default config;
