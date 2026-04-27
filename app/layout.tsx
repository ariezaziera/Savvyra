import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Savvyra",
  description: "Personal finance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-gray-800">
        <Navbar />
        {children}
      </body>
    </html>
  );
}