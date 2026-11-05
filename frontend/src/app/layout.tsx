import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RESOLVENigeria — Transaction Redress & Dispute Resolution",
  description: "Intelligent, verified consumer redress for failed transfers, online vendor non-delivery, undelivered airtime, and unauthorized debits under CBN, NCC, and FCCPC rules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-[#D95D39] selection:text-white bg-[#FAF6F0] text-[#2B1E1A]`}>
        {children}
      </body>
    </html>
  );
}
