import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Savvyra",
  description: "Personal finance dashboard",
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-gray-800`}>
        <Navbar />
        <main className="md:ml-16 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}