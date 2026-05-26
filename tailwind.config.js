/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,html}'],
  theme: {
    extend: {
      fontFamily: {
        ud: ['"UD Digi Kyokasho NK-R"', '"BIZ UDPGothic"', 'system-ui', 'sans-serif'],
        biz: ['"BIZ UDPGothic"', 'system-ui', 'sans-serif'],
        noto: ['"Noto Sans JP"', 'sans-serif'],
        dyslexie: ['"OpenDyslexic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
