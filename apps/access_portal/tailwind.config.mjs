/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./styles/**/*.{js,jsx,css}",
    "../../packages/global-components/src/**/*.{js,jsx}",
    "../../packages/shared-ui/src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
