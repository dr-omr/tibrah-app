const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const isMobileBuild = process.env.BUILD_MODE === 'mobile';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static export for Capacitor if BUILD_MODE=mobile
    ...(isMobileBuild && { output: 'export' }),

    reactStrictMode: true,
    swcMinify: true,

    // TypeScript: all errors fixed ✅
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: true,
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
        unoptimized: isMobileBuild ? true : false, // Required for static export
        domains: [
            'cdn-icons-png.flaticon.com',
            'lh3.googleusercontent.com',  // Google Profile Photos
            'firebasestorage.googleapis.com',  // Firebase Storage
            'images.unsplash.com', // Article Images
            'qtrypzzcjebvfcihiynt.supabase.co', // Supabase Storage
            'graph.facebook.com', // Facebook Profile Photos
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

    // ═══ TOOL LINK REDIRECTS ═══
    // Route missing /assess/*, /programs/*, /tools/* to real existing pages
    // Decision: Option B — use real existing pages, not placeholders
    async redirects() {
        return [
            // ── /assess/* → existing assessment pages ──
            { source: '/assess/anxiety',       destination: '/symptom-checker',    permanent: false },
            { source: '/assess/beliefs',       destination: '/emotional-medicine', permanent: false },
            { source: '/assess/cognitive',     destination: '/intake',             permanent: false },
            { source: '/assess/depression',    destination: '/symptom-checker',    permanent: false },
            { source: '/assess/disconnection', destination: '/emotional-medicine', permanent: false },
            { source: '/assess/identity',      destination: '/emotional-medicine', permanent: false },
            { source: '/assess/inner-balance', destination: '/quick-check-in',     permanent: false },
            { source: '/assess/inner-speech',  destination: '/emotional-medicine', permanent: false },
            { source: '/assess/meaning',       destination: '/emotional-medicine', permanent: false },
            { source: '/assess/presence',      destination: '/quick-check-in',     permanent: false },

            // ── /programs/* → courses or specific existing pages ──
            { source: '/programs/belief-reprogramming', destination: '/courses',    permanent: false },
            { source: '/programs/discipline',           destination: '/courses',    permanent: false },
            { source: '/programs/emotions/:path*',      destination: '/courses',    permanent: false },
            { source: '/programs/meaning-journey',      destination: '/courses',    permanent: false },
            { source: '/programs/meditation',           destination: '/meditation', permanent: false },
            { source: '/programs/mind-body',            destination: '/courses',    permanent: false },
            { source: '/programs/morning-ritual',       destination: '/courses',    permanent: false },
            { source: '/programs/movement',             destination: '/courses',    permanent: false },
            { source: '/programs/nutrition',            destination: '/courses',    permanent: false },
            { source: '/programs/sleep',                destination: '/courses',    permanent: false },
            { source: '/programs/success-engineering',  destination: '/courses',    permanent: false },

            // ── /tools/* → existing tool pages ──
            { source: '/tools/gratitude',   destination: '/daily-log',          permanent: false },
            { source: '/tools/grounding',   destination: '/breathe',            permanent: false },
            { source: '/tools/journal',     destination: '/daily-log',          permanent: false },
            { source: '/tools/reframe',     destination: '/emotional-medicine', permanent: false },
            { source: '/tools/vision',      destination: '/daily-log',          permanent: false },
            { source: '/tools/weekly-plan', destination: '/daily-log',          permanent: false },
        ];
    },
};

// PWA: Disable for mobile builds (Capacitor handles it natively)
const pwaOptions = {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development' || isMobileBuild,
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
        {
            urlPattern: /\.(?:mp3|wav|m4a|ogg)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'audio-assets',
                expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
        },
    ],
};

const withPWA = require('next-pwa')(pwaOptions);

module.exports = withBundleAnalyzer(withPWA(nextConfig));
