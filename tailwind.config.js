/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/views/**/*.erb",
    "./app/helpers/**/*.rb",
    "./app/javascript/**/*.js",
    "./app/assets/stylesheets/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#212122',
          light: '#3C3C30',
          paper: '#2A2A2B',
          darker: '#1A1A1B',
        },
        fable: {
          light: '#F8F5F0', // Soft warm latte
          DEFAULT: '#F3EFE6', // Light beige / café com leite
          dark: '#EAE5D9', // Slightly deeper beige
        },
        terracotta: '#D97A5E',
        sage: '#A5B5A1',
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'serif'],
        sans: ['Inter', 'Instrument Sans', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up-delay-1': 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-in-up-delay-2': 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
        'fade-in-up-delay-3': 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards',
        'fade-in': 'fade-in 1.5s ease-out forwards',
        'float': 'float 8s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
