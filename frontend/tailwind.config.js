/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "page-bg": "#FAF9F5",
        "panel-bg": "#F0EFEB",
        "soft-card": "#E9E8E4",
        "soft-card-2": "#F4F3EF",
        "text": "#1B1B1B",
        "muted": "#8C8880",
        "muted-light": "#BDBAB2",
        "line": "#D9D7D0",
        "black": "#181818",
        "deep-black": "#151515",
        "white-card": "#FFFDF8",
        "white-soft": "#FAF9F5"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        "3xl": "2rem",
        "4xl": "3rem"
      },
      spacing: {
        "gutter": "24px",
        "unit": "4px",
        "sm": "16px",
        "md": "32px",
        "xl": "128px",
        "lg": "64px",
        "margin": "40px",
        "xs": "8px",
        "section": "160px"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        label: ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        h2: ["Inter", "sans-serif"],
        h1: ["Inter", "sans-serif"],
        h3: ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        label: ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "letterSpacing": "0", "fontWeight": "400" }],
        display: ["82px", { "lineHeight": "1.05", "letterSpacing": "-0.04em", "fontWeight": "700" }],
        h2: ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        h1: ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.03em", "fontWeight": "700" }],
        h3: ["24px", { "lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-md": ["15px", { "lineHeight": "1.6", "letterSpacing": "0", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
}
