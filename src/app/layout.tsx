// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Shipping Label Generator | 4x6 Thermal Labels",
  description:
    "Create free 4x6 thermal shipping labels for courier, warehouse, ecommerce, Amazon, Flipkart, Blinkit and self delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}