/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.{html,js}", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#172554", // Example: Orange 500 from Material colors
      },
    },
  },
  plugins: [require("daisyui")],
};
