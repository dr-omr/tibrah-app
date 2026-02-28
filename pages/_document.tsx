import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="ar" dir="rtl">
            <Head>
                {/* Preconnect to external domains for faster loading */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://firebasestorage.googleapis.com" />

                {/* Fonts - preloaded for faster rendering */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />

                {/* SEO Meta */}
                <meta name="description" content="طِبرَا - العيادة الرقمية للطب الوظيفي والتكاملي. اكتشف صحتك بطريقة جديدة مع الدكتور عمر." />
                <meta name="keywords" content="طب وظيفي, صحة, تغذية, مكملات, طبرا, عيادة رقمية, دكتور عمر" />
                <meta name="author" content="د. عمر العماد" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="طِبرَا — العيادة الرقمية" />
                <meta property="og:description" content="عيادتك الرقمية المتكاملة للطب الوظيفي والتكاملي. مساعد ذكي، متابعة صحية، ومتجر مكملات." />
                <meta property="og:image" content="/icons/icon-512x512.png" />
                <meta property="og:locale" content="ar_SA" />
                <meta property="og:site_name" content="طِبرَا" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="طِبرَا — العيادة الرقمية" />
                <meta name="twitter:description" content="عيادتك الرقمية المتكاملة للطب الوظيفي والتكاملي" />
                <meta name="twitter:image" content="/icons/icon-512x512.png" />

                {/* PWA Meta Tags */}
                <meta name="application-name" content="طِبرَا" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="طِبرَا" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#2D9B83" />

                {/* DNS Prefetch for external APIs */}
                <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
                <link rel="dns-prefetch" href="https://api.groq.com" />

                {/* PWA Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Apple Touch Icons */}
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

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
