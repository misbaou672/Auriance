module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                'auriance-blue': '#002D5E',
                'auriance-teal': '#4ECDC4',
                'auriance-light': '#F7FFF7',
            },
        },
    },
    plugins: [],
};
