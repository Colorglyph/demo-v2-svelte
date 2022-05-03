module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwind-children'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-image-rendering')()
  ]
};