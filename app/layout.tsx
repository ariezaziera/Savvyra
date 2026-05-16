import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import ScrollbarController from "@/components/ScrollbarController";
import SessionTimeout from "@/components/SessionTimeout";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Savvyra",
  description: "Personal finance dashboard",
  manifest: "/manifest.webmanifest",

  themeColor: "#563db5",

  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Savvyra",
  },

openGraph: {
    title: "Savvyra — Track every ringgit",
    description: "Beautiful personal finance, built for Malaysians.",
    url: "https://savvyra.vercel.app",
    siteName: "Savvyra",
    images: [
      {
        url: "https://savvyra.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Savvyra — Personal Finance App",
      },
    ],
    type: "website",
    locale: "en_MY",
  },
  twitter: {
    card: "summary_large_image",
    title: "Savvyra — Track every ringgit",
    description: "Beautiful personal finance, built for Malaysians.",
    images: ["https://savvyra.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{
        height: "100%",
        background: "#563db5",
      }}
    >
      <body
        className={inter.className}
        style={{
          height: "100%",
          margin: 0,
          background: "#563db5",
        }}
      >
        <SplashScreen />
        <ScrollbarController />
        <SessionTimeout />
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}