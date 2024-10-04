import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateFavicon } from "@/utils/generateFavicon";

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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
