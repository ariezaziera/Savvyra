"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Savings Goals", href: "/savings" },
  { label: "Commitments", href: "/commitments" },
  { label: "Settings", href: "/settings" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden bg-white">
              <Image
                src="/logo.png"
                alt="Savvyra Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-base font-semibold text-gray-900">Savvyra</h1>
              <p className="text-xs text-gray-500">Personal Finance</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-blue-50 font-medium text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1">
              <div className="h-0.5 w-5 rounded bg-gray-700"></div>
              <div className="h-0.5 w-5 rounded bg-gray-700"></div>
              <div className="h-0.5 w-5 rounded bg-gray-700"></div>
            </div>
          </button>
        </div>

        {menuOpen && (
          <div className="mt-4 border-t border-gray-200 pt-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}