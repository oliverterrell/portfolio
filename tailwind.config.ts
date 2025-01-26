// const plugin = require('tailwindcss/plugin')

const safelist = [
  { pattern: /(?<!\s)-(primary|lightblue|accent|turtle|lightGray|medGray)/ },
  /(bottom|top|left|right|h|max-h|min-h|w|z|origin-x-|-origin-x-|translate-x|-translate-x|border)-\b[0-9]{1,3}\b/,
];

/** @type {import("tailwindcss").Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        md: '820px',
        lg: '1225px',
      },
      fontFamily: {
        abelReg: "'Abel-Regular'",
        abel: "'Abel-Pro'",
        bold: "'Abel-Pro-Bold'",
      },
      colors: {
        primary: '#000000', // primary color of app
        accent: '#ea4292', // What pops out
        turtle: '#29959C', // Jackson's turquoise
        lightblue: '#05C2FF', // Good light blue
        secondary: '#3a3a3a',
        medGray: '#626262',
        lightGray: '#d9d9d9',
        correct: '#28CE6B',
        incorrect: '#FD0E0E',
      },
      boxShadow: {
        'all-xs': '0 0 5px 0 rgba(0, 0, 0, 0.05)',
        'all-sm': '0 0 7px 0 rgba(0, 0, 0, 0.05)',
        'all-md': '0 0 13px 0 rgba(0, 0, 0, 0.1), 0 0 4px -1px rgba(0, 0, 0, 0.06)',
        'all-lg': '0 0 15px 1px rgba(0, 0, 0, 0.1), 0 0 6px -2px rgba(0, 0, 0, 0.05)',
        'all-xl': '0 0 20px 5px rgba(0, 0, 0, 0.1), 0 0 10px -5px rgba(0, 0, 0, 0.04)',
        'all-2xl': '0 0 30px 10px rgba(0, 0, 0, 0.1)',
        'all-3xl': '0 0 40px 13px rgba(0, 0, 0, 0.08)',
        'all-4xl': '0 0 50px 16px rgba(0, 0, 0, 0.97)',
        'all-5xl': '0 0 60px 20px rgba(0, 0, 0, 0.97)',
        'all-6xl': '0 0 75px 35px rgba(0, 0, 0, 0.07)',
        'all-7xl': '0 0 90px 50px rgba(0, 0, 0, 0.07)',
        'all-8xl': '0 0 100px 60px rgba(0, 0, 0, 0.07)',
        'all-9xl': '0 0 110px 80px rgba(0, 0, 0, 0.15)',
        'all-10xl': '0 0 120px 100px rgba(0, 0, 0, 0.1)',
        't-soft': '0 -2px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        't-sm': '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        't-md': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        't-lg': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        't-xl': '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        't-2xl': '0 -25px 50px -12px rgba(0, 0, 0, 0.25)',
        't-3xl': '0 -35px 60px -15px rgba(0, 0, 0, 0.3)',
        'b-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'b-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        'b-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)',
        'b-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04)',
        'b-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'b-3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'l-sm': '-1px 0 2px 0 rgba(0, 0, 0, 0.05)',
        'l-md': '-4px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 4px -1px rgba(0, 0, 0, 0.06)',
        'l-lg': '-10px 0 15px -3px rgba(0, 0, 0, 0.1), 4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        'l-xl': '-20px 0 25px -5px rgba(0, 0, 0, 0.1), 10px 0 10px -5px rgba(0, 0, 0, 0.04)',
        'l-2xl': '-25px 0 50px -12px rgba(0, 0, 0, 0.25)',
        'l-3xl': '-35px 0 60px -15px rgba(0, 0, 0, 0.3)',
        'r-sm': '1px 0 2px 0 rgba(0, 0, 0, 0.05)',
        'r-md': '4px 0 6px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.06)',
        'r-lg': '10px 0 15px -3px rgba(0, 0, 0, 0.1), -4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        'r-xl': '20px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04)',
        'r-2xl': '25px 0 50px -12px rgba(0, 0, 0, 0.25)',
        'r-3xl': '35px 0 60px -15px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        pulsate: {
          '0%': {
            scale: '0.9',
          },
          '50%': {
            scale: '1.1',
          },
          '100%': {
            scale: '1',
          },
        },
        scroll: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-100px,0,0)' },
        },
      },
      animation: {
        pulsate: 'pulsate 0.6s ease-in-out repeat infinity',
        scroll: 'scroll 5s linear infinite',
      },
    },
  },
  plugins: [
    require('@xpd/tailwind-3dtransforms'),
    '@tailwindcss/forms',
    'tailwind-extended-shadows',
    'prettier-plugin-tailwindcss',
    ({ addUtilities }) => {
      const newUtilities = {
        '.bg-icon-pattern': {
          'background-image': `url("/icon-pattern.png")`,
          'background-repeat': 'repeat',
        },
        '.w-full-abs': {
          width: 'calc(100dvw - 24px)',
          maxWidth: '390px',
        },
        '.backface-visible': {
          'backface-visibility': 'visible',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.font-outline-dark': {
          'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        },
        '.font-outline-light': {
          'text-shadow': '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF',
        },
        '.font-outline-dark-2': {
          'text-shadow': '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        },
        '.font-outline-light-2': {
          'text-shadow': '-2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF, 2px 2px 0 #FFF',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover', 'focus']);
    },
  ],
  safelist: safelist,
};
