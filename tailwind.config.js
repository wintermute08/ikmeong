/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#C6613F',
        'accent-light': '#FDF0EB',
        'accent-mid': '#E8896A',
        ink: '#111111',
        ink2: '#555555',
        ink3: '#AAAAAA',
        surface: '#F7F7F8',
        surface2: '#EFEFEF',
        line: '#EBEBEB',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        modal: '0 8px 48px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
