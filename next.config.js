const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest.json$/],
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'images',
                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-resources',
                expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'firebase-storage',
                expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
        },
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // TypeScript: all errors fixed ✅
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },

    // Tree-shake icon imports to reduce bundle size
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },

    // Compiler optimizations for production
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Handle image domains
    images: {
        domains: [
            'qtrypzzcjebvfcihiynt.supabase.co',
            'cdn-icons-png.flaticon.com',
            'lh3.googleusercontent.com',  // Google Profile Photos
            'firebasestorage.googleapis.com',  // Firebase Storage
            'images.unsplash.com', // Article Images
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
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

    // Security headers for all pages
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                ],
            },
        ];
    },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
