/**
 * Mobile-specific Next.js Config (for Capacitor builds)
 * 
 * Usage: NEXT_CONFIG_FILE=next.config.mobile.js next build
 * Or via: npm run build:mobile
 * 
 * This config enables static export needed by Capacitor,
 * but excludes API routes (they run on Vercel server-side).
 */

const path = require('path');
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: true, // PWA handled by Capacitor on mobile
    buildExcludes: [/middleware-manifest.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Required for Capacitor
    reactStrictMode: true,
    swcMinify: true,

    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: true, // Speed up mobile builds
    },

    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },

    compiler: {
        removeConsole: {
            exclude: ['error', 'warn'],
        },
    },

    images: {
        unoptimized: true,
    },

    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname);
        return config;
    },
};

module.exports = withPWA(nextConfig);
