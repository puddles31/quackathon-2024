/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['app.js', 'views/*.ejs', 'views/partials/*.ejs'],
  theme: {
    container: {
      center: true
    },
    screens: {
      'sm': '640px',      
      'md': '768px',      
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1560px'
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },
      colors: {
        'primary': '#2C3E50',
      }
    },
  },
  plugins: [],
}

