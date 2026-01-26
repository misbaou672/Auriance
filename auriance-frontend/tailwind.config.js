// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'heidi-beige': '#f5f1e8',
                'heidi-beige-light': '#faf8f5',
                'heidi-beige-dark': '#e8dfc8',
                'heidi-brown': '#2e1d00',
                'heidi-dark': '#2c3e50',
                'heidi-text': '#333333',
                'heidi-border': '#d1c9b8',
                'heidi-bg': '#ffffff',
                'heidi-hover': '#e8dfc8',
                medical: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                }
            },
            animation: {
                'slide-in-from-right': 'slide-in-from-right 0.8s ease-out forwards',
                'slide-in-from-left': 'slide-in-from-left 0.8s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            backdropBlur: {
                'heidi': '20px',
            }
        },
    },
    plugins: [],
}