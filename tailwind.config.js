module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom brand colors for Foodles
      colors: {
        'cyber-green': '#4ADE80',    // green-400 - primary accent
        'cyber-black': '#000000',    // pure black background
        'cyber-gray': '#111111',     // card backgrounds
      },
      keyframes: {
        // Slide-in animation for page transitions
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        // Pulse animation for loading states and indicators
        'pulse': 'pulse 1.5s ease-in-out infinite',
        // Slide-in animation for smooth page entries
        'slideIn': 'slideIn 0.5s ease-out forwards'
      },
      screens: {
        // Extra small screen breakpoint
        'xs': '375px',
      },
    },
  },
  plugins: [],
}

