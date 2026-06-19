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
    </html>
  );
}
