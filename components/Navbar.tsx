"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Savings Goals", href: "/savings" },
  { label: "Commitments", href: "/commitments" },
  { label: "Settings", href: "/settings" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (isAuthPage) return; // skip check kalau kat auth pages
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [isAuthPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const LogoSection = (
    <div className="flex items-center gap-3">
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
    </div>
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-4 pb-4">
        <div className="flex items-center justify-between">

          {/* Logo — clickable only if bukan auth page */}
          {isAuthPage ? (
            <div>{LogoSection}</div>
          ) : (
            <Link href="/">{LogoSection}</Link>
          )}

          {/* Nav — hide kalau auth page */}
          {!isAuthPage && (
            <>
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

                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="ml-2 flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </button>
                )}
              </nav>

              {/* Hamburger — mobile */}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="sr-only">Open menu</span>
                <div className="space-y-1">
                  <div className="h-0.5 w-5 rounded bg-gray-700"></div>
                  <div className="h-0.5 w-5 rounded bg-gray-700"></div>
                  <div className="h-0.5 w-5 rounded bg-gray-700"></div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {!isAuthPage && menuOpen && (
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

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}