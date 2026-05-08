"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  HandCoins,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Savings", href: "/savings", icon: PiggyBank },
  { label: "Commitments", href: "/commitments", icon: HandCoins },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  useEffect(() => {
    if (isAuthPage) return;

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

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      {!isAuthPage && (
        <aside
          className={`hidden md:flex flex-col fixed left-3 top-4 h-[calc(100vh-2rem)] z-50 transition-all duration-300 ease-in-out
            bg-[#2B1E59]/85 backdrop-blur-xl
            rounded-3xl
            border border-white/10
            shadow-[0_8px_40px_rgba(0,0,0,0.35)]
            ${expanded ? "w-56" : "w-16"}`}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-3 py-5 border-b border-white/10 rounded-full ${
              expanded ? "justify-start" : "justify-center"
            }`}
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white p-1">
              <Image
                src="/logo.png"
                alt="Savvyra"
                width={32}
                height={32}
                className="h-full w-full object-cover rounded-full"
              />
            </div>

            {expanded && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white leading-tight">
                  Savvyra
                </p>

                <p className="text-xs text-white/60">
                  Personal Finance
                </p>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <div key={label} className="relative group">
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
                      ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }
                      ${expanded ? "justify-start" : "justify-center"}`}
                  >
                    <Icon size={18} className="shrink-0" />

                    {expanded && (
                      <span className="truncate">
                        {label}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip */}
                  {!expanded && (
                    <div
                      className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <div className="relative bg-[#2B1E59] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/10">
                        {label}

                        <div
                          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0
                          border-t-4 border-b-4 border-r-4
                          border-t-transparent border-b-transparent border-r-[#2B1E59]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-2 py-4 border-t border-white/10 space-y-1">

            {/* Logout */}
            {isLoggedIn && (
              <div className="relative group">
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                    text-white/60 hover:bg-white/10 hover:text-white
                    transition-all duration-200
                    ${expanded ? "justify-start" : "justify-center"}`}
                >
                  <LogOut
                    size={18}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />

                  {expanded && <span>Logout</span>}
                </button>

                {!expanded && (
                  <div
                    className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="relative bg-[#2B1E59] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/10">
                      Logout

                      <div
                        className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0
                        border-t-4 border-b-4 border-r-4
                        border-t-transparent border-b-transparent border-r-[#2B1E59]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expand / Collapse */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                text-white/50 hover:bg-white/10 hover:text-white transition
                ${expanded ? "justify-start" : "justify-center"}`}
            >
              <ChevronRight
                size={18}
                className={`shrink-0 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />

              {expanded && (
                <span className="text-xs">
                  Collapse
                </span>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE NAV */}
      {!isAuthPage && (
        <nav
          className="fixed bottom-3 left-3 right-3 z-50 flex md:hidden items-center
          bg-[#2B1E59]/85 backdrop-blur-xl rounded-3xl
          border border-white/10
          shadow-[0_8px_40px_rgba(0,0,0,0.35)]
          px-2 py-4"
        >
          {/* Left Side */}
          {navItems.slice(0, 2).map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition
                  ${
                    isActive
                      ? "text-white font-medium"
                      : "text-white/45 hover:text-white"
                  }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}

          {/* Center Settings Button */}
          <div className="flex flex-col items-center justify-center px-3">
            <Link
              href="/settings"
              className={`w-18 h-18 rounded-full flex items-center justify-center -mt-10
                shadow-[0_8px_24px_rgba(106,73,250,0.45)]
                hover:scale-105 active:scale-95 transition-all duration-200
                ${
                  pathname === "/settings"
                    ? "bg-[#5B3FC4]"
                    : "bg-[#6A49FA]"
                }`}
            >
              <Settings size={22} className="text-white" />
            </Link>
          </div>

          {/* Right Side */}
          {navItems.slice(2, 4).map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition
                  ${
                    isActive
                      ? "text-white font-medium"
                      : "text-white/45 hover:text-white"
                  }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}