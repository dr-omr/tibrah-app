const path = require('path');
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest.json$/],
    runtimeCaching: [
        {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
                backgroundSync: {
                    name: 'api-queue',
                    options: {
                        maxRetentionTime: 24 * 60,
                    },
                },
            },
        },
        {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
            method: 'GET',
        }
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Ignore TypeScript and ESLint errors during build (for Vercel deployment)
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Handle image domains
    images: {
        domains: [
            'qtrypzzcjebvfcihiynt.supabase.co',
            'cdn-icons-png.flaticon.com',
            'lh3.googleusercontent.com',  // Google Profile Photos
            'firebasestorage.googleapis.com',  // Firebase Storage
        ],
        formats: ['image/avif', 'image/webp'],
    },

    // Webpack configuration for path aliases
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname);
        return config;
    },

    // Experimental features
    experimental: {
        // Enable if needed
    },
};

module.exports = withPWA(nextConfig);
