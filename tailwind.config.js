module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './Layout.js',
        './Layout.tsx',
    ],
    theme: {
        extend: {
            // Dynamic theme colors
            colors: {
                primary: {
                    DEFAULT: 'var(--primary)',
                    light: 'var(--primary-light)',
                    dark: 'var(--primary-dark)',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    light: '#F4D03F',
                },
                tibrah: {
                    DEFAULT: 'var(--primary)',
                    light: 'var(--primary-light)',
                    dark: 'var(--primary-dark)',
                },
            },
            // Typography
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
            },
            fontSize: {
                'xs': '0.75rem',
                'sm': '0.875rem',
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
            },
            // Unified Spacing
            spacing: {
                'xs': '0.25rem',
                'sm': '0.5rem',
                'md': '1rem',
                'lg': '1.5rem',
                'xl': '2rem',
                '2xl': '3rem',
                '3xl': '4rem',
            },
            // Unified Border Radius
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                'full': '9999px',
            },
            // Unified Shadows
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                'soft': '0 4px 30px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 40px rgba(45, 155, 131, 0.15)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
            // Z-Index
            zIndex: {
                'dropdown': '50',
                'sticky': '100',
                'fixed': '200',
                'modal': '300',
                'popover': '400',
                'tooltip': '500',
            },
        },
    },
    plugins: [],
};

