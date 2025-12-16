import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="ar" dir="rtl">
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="طِبرَا - العيادة الرقمية للطب الوظيفي والتكاملي" />
            </Head>
            <body className="bg-slate-50">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
