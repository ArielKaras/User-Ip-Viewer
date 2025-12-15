/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Zinc-Dark-Glass Palette
                background: '#09090b',
                surface: {
                    primary: 'rgba(24, 24, 27, 0.4)',
                    secondary: 'rgba(24, 24, 27, 0.2)',
                },
                border: {
                    DEFAULT: 'rgba(63, 63, 70, 0.5)',
                    subtle: 'rgba(39, 39, 42, 0.5)',
                },
                text: {
                    primary: '#e4e4e7',
                    secondary: '#71717a',
                    accent: '#ffffff',
                },
                status: {
                    success: {
                        text: '#10b981',
                        bg: 'rgba(16, 185, 129, 0.1)',
                        border: 'rgba(16, 185, 129, 0.2)',
                    },
                    warning: {
                        text: '#f59e0b',
                        bg: 'rgba(245, 158, 11, 0.1)',
                        border: 'rgba(245, 158, 11, 0.2)',
                    },
                    error: {
                        text: '#ef4444',
                        bg: 'rgba(69, 10, 10, 0.1)',
                        border: 'rgba(127, 29, 29, 0.3)',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                md: '12px',
                xl: '24px',
            },
            borderRadius: {
                card: '1rem',
            },
        },
    },
    plugins: [],
}
