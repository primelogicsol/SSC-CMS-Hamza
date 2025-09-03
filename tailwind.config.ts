import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "fixnix-lightpurple": "#70436b",
        "fixnix-darkpurple": "#472a44",
      }
    }
  },
  plugins: []
} satisfies Config;


