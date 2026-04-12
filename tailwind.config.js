/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DFFF00",
        "on-primary": "#2d2f2b",
        "primary-container": "#DFFF00",
        "on-primary-container": "#505d00",
        surface: "#f7f7f0",
        "on-surface": "#2d2f2b",
        "surface-container": "#f0eded",
        "surface-container-low": "#f6f3f2",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e8e9e1",
        "on-surface-variant": "#474842",
        outline: "#777870",
        "outline-variant": "#c8c8bc",
        tertiary: "#8b3700",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#b24800",
        "on-tertiary-container": "#ffe4d9",
        error: "#ba1a1a",
      },
      fontFamily: {
        headline: ["Work Sans"],
        body: ["Inter"],
        label: ["Work Sans"],
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
