import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Haber Ağı",
  description: "Uluslararası haber ve analizlerin güvenilir kaynağı.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <style>{`
          body {
            background-color: white !important;
          }
          #__next {
            background-color: white !important;
          }
        `}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
