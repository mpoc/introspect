/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'client/index.html',
    'client/src/**/*.{js,ts,jsx,tsx}',
    'node_modules/@llamaindex/chat-ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
