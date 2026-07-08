import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const siteUrl = "https://free-shipping-label-generator.baikolife.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Free Shipping Label Generator | 4×6 Thermal Labels",
  description:
    "Create free 4×6 thermal shipping labels for courier, warehouse, ecommerce, Amazon, Flipkart, Blinkit and self delivery. Generate labels with barcode, box count, dimensions and weight.",

  keywords: [
    "free shipping label generator",
    "4x6 shipping label",
    "thermal shipping label",
    "courier label generator",
    "warehouse label generator",
    "Amazon shipping label",
    "Flipkart shipping label",
    "Blinkit warehouse label",
    "barcode shipping label",
    "shipping label PDF",
  ],

  authors: [{ name: "Baiko Life" }],
  creator: "Baiko Life",
  publisher: "Baiko Life",
  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Free Shipping Label Generator | 4×6 Thermal Labels",
    description:
      "Generate free thermal printer ready 4×6 shipping labels with AWB barcode, box details, dimensions and weight.",
    url: siteUrl,
    siteName: "Free Shipping Label Generator by Baiko",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Free Shipping Label Generator by Baiko",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Free Shipping Label Generator | 4×6 Thermal Labels",
    description:
      "Create free 4×6 shipping labels for courier, ecommerce, warehouse and self delivery.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}