import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import ScrollbarController from "@/components/ScrollbarController";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Savvyra",
  description: "Personal finance dashboard",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body className={inter.className} style={{ height: "100%", margin: 0 }}>
        <ScrollbarController />
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}