import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateFavicon } from "@/utils/generateFavicon";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

const faviconUrl = generateFavicon();

export const metadata: Metadata = {
  title: "Beat Battle",
  description: "Discover your favorite tracks through music battles!",
  icons: [
    { rel: 'icon', url: faviconUrl },
    { rel: 'apple-touch-icon', url: faviconUrl },
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
        <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1QJN3FY5V1"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-1QJN3FY5V1');
        `}
      </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
