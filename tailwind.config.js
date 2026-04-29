module.exports = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './hooks/**/*.{js,ts,jsx,tsx}',
        './contexts/**/*.{js,ts,jsx,tsx}',
        './lib/**/*.{js,ts,jsx,tsx}',
        './styles/**/*.css',

        './Layout.js',
        './Layout.tsx',
    ],
    theme: {
        extend: {
            // ============================================
            // TIBRAH ELITE PSYCHOLOGICAL COLOR SYSTEM
            // ============================================
            colors: {
                primary: {
                    DEFAULT: '#0891B2',
                    light: '#22D3EE',
                    dark: '#0E7490',
                },
                tibrah: {
                    // Global Medical Canvas
                    canvas: '#F0FBFE', // Light cyan canvas
                    
                    // Clinical Cyan (Brand Core)
                    teal: '#0891B2', // The chosen color
                    
                    // Dark Authority Typography
                    obsidian: '#083D4F',
                    
                    // The Compassionate Accents
                    rose: '#F43F5E',
                    azure: '#3B82F6',
                    amber: '#FBBF24',
                    
                    // Structural Shades
                    muted: '#64748B',
                    surface: '#FFFFFF',
                },
                medical: {
                    canvas: '#F0FBFE',
                    teal: '#0891B2',
                    heading: '#083D4F',
                    muted: '#64748B',
                }
            },
            
            // High-End Typography Architecture
            fontFamily: {
                sans: ['var(--font-alexandria)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-outfit)', 'monospace'],
                tajawal: ['var(--font-alexandria)', 'system-ui'],
                inter: ['var(--font-outfit)', 'sans-serif'],
            },
            
            // Micro-Rhythm Typology
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.6rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
                '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
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
            
            // Ceramic Corners
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                'full': '9999px',
            },
            
            // Unified Lux Shadows (Parallax Depth - High Fidelity)
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'lux-sm': '0 4px 12px rgba(16, 24, 34, 0.03), inset 0 2px 4px rgba(255,255,255,1)',
                'lux-md': '0 12px 32px rgba(16, 24, 34, 0.05), inset 0 2px 4px rgba(255,255,255,0.8)',
                'lux-lg': '0 24px 64px rgba(16, 24, 34, 0.06), inset 0 1px 2px rgba(255,255,255,0.5)',
                'glass-glow': '0 0 50px rgba(8, 145, 178, 0.18)',
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
            
            // Core Animation Physics
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                }
            },
            animation: {
                shimmer: 'shimmer 3s ease-in-out infinite',
                'gradient-x': 'gradient-x 3s ease infinite',
                'float-slow': 'float 12s ease-in-out infinite',
                'float-medium': 'float 8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
