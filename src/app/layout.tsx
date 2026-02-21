import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ayura อายุระ | กล่องสุขภาพจากธรรมชาติ",
  description:
    "ระบบ AI จับคู่วัตถุดิบสุขภาพและสมุนไพรจากชุมชน จัดส่งเป็นกล่องสุขภาพรายสัปดาห์",
  keywords: ["สุขภาพ", "สมุนไพร", "ออร์แกนิก", "AI", "subscription box", "อายุระ"],
};

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
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
