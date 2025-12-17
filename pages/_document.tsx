import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="ar" dir="rtl">
            <Head>
                {/* Fonts */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />

                {/* SEO Meta */}
                <meta name="description" content="طِبرَا - العيادة الرقمية للطب الوظيفي والتكاملي. اكتشف صحتك بطريقة جديدة مع الدكتور عمر." />

                {/* PWA Meta Tags */}
                <meta name="application-name" content="طِبرَا" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="طِبرَا" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#2D9B83" />

                {/* PWA Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Apple Touch Icons */}
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

                {/* Splash Screens for iOS */}
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Microsoft Tiles */}
                <meta name="msapplication-TileColor" content="#2D9B83" />
                <meta name="msapplication-tap-highlight" content="no" />
            </Head>
            <body className="bg-slate-50">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
