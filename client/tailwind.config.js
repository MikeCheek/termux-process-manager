/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Mapping the colors from your image/CSS
                'gh-bg': '#0d1117',
                'gh-card': '#161b22',
                'gh-inner': '#0d1117',
                'gh-border': '#30363d',
                'gh-text': '#c9d1d9',
                'gh-dim': '#8b949e',
                'gh-accent': '#58a6ff',
                'gh-success': '#238636',
                'gh-danger': '#f85149',
            },
            fontFamily: {
                mono: ['Fira Code', 'Cascadia Code', 'monospace'],
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                'sticky': '0 -10px 30px rgba(0, 0, 0, 0.5)',
            },
            keyframes: {
                progress: {
                    '0%': { width: '100%' },
                    '100%': { width: '0%' },
                },
            },
            animation: {
                progress: 'progress 3s linear forwards',
            }
        },
    },
    plugins: [],
}