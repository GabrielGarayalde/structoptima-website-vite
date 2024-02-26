/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.{html,js}", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        
        primary: "#172554", // Example: Orange 500 from Material colors
        accent: "#ea580c",
      },
    },
  },
  plugins: [require("daisyui")],
};
