/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/workflow-engine-app.jsx',
    './src/workflow-engine.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
