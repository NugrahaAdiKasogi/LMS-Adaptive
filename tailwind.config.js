/** @type {import('tailwindcss').Config} */
export default {
  // 1. Tambahkan path ini ke array 'content'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js", // <-- TAMBAHKAN INI
  ],
  theme: {
    extend: {},
  },
  // 2. Tambahkan 'flowbite/plugin' ke array 'plugins'
  plugins: [
  ],
};
