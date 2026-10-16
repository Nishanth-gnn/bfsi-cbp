/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1c', // deep midnight navy
        surface: '#12182b', // slightly lighter navy
        surfaceHover: '#1e293b',
        primary: '#3b82f6', // electric blue
        primaryHover: '#2563eb',
        success: '#10b981', // emerald green
        danger: '#ef4444', // soft red
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        border: '#1e293b',
      }
    },
  },
  plugins: [],
}
