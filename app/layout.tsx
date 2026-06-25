import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stageria — AI Virtual Staging",
  description: "Przekształć puste lub zastawione pomieszczenie w pięknie umeblowane wnętrze w kilka sekund.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta name="facebook-domain-verification" content="7f6rbj6nmwsbpz7gw7nb1ojnir44f5" />
        <meta name="google-site-verification" content="NXk3ETviA_m-WKvZzHQJlcWwlXaWsJ6zpLpdabjgkC4" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap"
        />
      </head>
      <body>{children}</body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-E7VDVKKHND" strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-E7VDVKKHND');
      `}</Script>
      <Script id="meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1052829580735800');
        fbq('track', 'PageView');
      `}</Script>
      <noscript><img height="1" width="1" style={{display:"none"}}
        src="https://www.facebook.com/tr?id=1052829580735800&ev=PageView&noscript=1"
        alt=""
      /></noscript>
    </html>
  );
}
