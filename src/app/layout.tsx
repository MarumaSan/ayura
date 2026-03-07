import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ayura อายุระ | กล่องสุขภาพจากธรรมชาติ",
  description: "ระบบจัดส่งวัตถุดิบสุขภาพและสมุนไพรจากชุมชน จัดส่งเป็นกล่องสุขภาพรายสัปดาห์",
  keywords: ["สุขภาพ", "สมุนไพร", "ออร์แกนิก", "subscription box", "อายุระ", "วัตถุดิบสด"],
  authors: [{ name: "Ayura" }],
  creator: "Ayura",
  publisher: "Ayura",
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Ayura อายุระ | กล่องสุขภาพจากธรรมชาติ",
    description: "ระบบจัดส่งวัตถุดิบสุขภาพและสมุนไพรจากชุมชน จัดส่งเป็นกล่องสุขภาพรายสัปดาห์",
    type: "website",
    locale: "th_TH",
    siteName: "Ayura",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayura อายุระ | กล่องสุขภาพจากธรรมชาติ",
    description: "ระบบจัดส่งวัตถุดิบสุขภาพและสมุนไพรจากชุมชน",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://ayura.com",
  },
  category: "health",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2D6A4F",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${notoSansThai.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen">
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </body>
    </html>
  );
}
