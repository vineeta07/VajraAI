import tailwindcss from '@tailwindcss/vite'

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
        dark: '#1F2937',
      },
    },
  },
  plugins: [tailwindcss()],
}
