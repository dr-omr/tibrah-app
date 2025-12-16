const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Handle image domains
    images: {
        domains: ['qtrypzzcjebvfcihiynt.supabase.co', 'cdn-icons-png.flaticon.com'],
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

module.exports = nextConfig;
