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
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Savings Goals", href: "/savings", icon: PiggyBank },
  { label: "Commitments", href: "/commitments", icon: HandCoins },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

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
          className={`hidden md:flex flex-col fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
            bg-[#FFF9EB]/90 backdrop-blur-md border-r border-[#9FB2AC]/30
            ${expanded ? "w-56" : "w-16"}`}
        >
          {/* Logo */}
          <div className={`flex items-center gap-3 px-3 py-5 border-b border-[#9FB2AC]/30 ${expanded ? "justify-start" : "justify-center"}`}>
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="Savvyra"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            {expanded && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-[#5D0D18] leading-tight">Savvyra</p>
                <p className="text-xs text-[#9FB2AC]">Personal Finance</p>
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
                      ${isActive
                        ? "bg-[#5D0D18] text-[#FFF9EB]"
                        : "text-[#5D0D18]/70 hover:bg-[#9FB2AC]/20 hover:text-[#5D0D18]"
                      }
                      ${expanded ? "justify-start" : "justify-center"}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {expanded && <span className="truncate">{label}</span>}
                  </Link>

                  {/* Tooltip — only when collapsed */}
                  {!expanded && (
                    <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-[#5D0D18] text-[#FFF9EB] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {label}
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0
                          border-t-4 border-b-4 border-r-4
                          border-t-transparent border-b-transparent border-r-[#5D0D18]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout + Expand Toggle */}
          <div className="px-2 py-4 border-t border-[#9FB2AC]/30 space-y-1">
            {isLoggedIn && (
              <div className="relative group">
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                    text-[#5D0D18]/60 hover:bg-[#5D0D18]/10 hover:text-[#5D0D18] transition
                    ${expanded ? "justify-start" : "justify-center"}`}
                >
                  <LogOut size={18} className="shrink-0" />
                  {expanded && <span>Logout</span>}
                </button>

                {!expanded && (
                  <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-[#5D0D18] text-[#FFF9EB] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      Logout
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0
                        border-t-4 border-b-4 border-r-4
                        border-t-transparent border-b-transparent border-r-[#5D0D18]" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expand/Collapse button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                text-[#9FB2AC] hover:bg-[#9FB2AC]/20 hover:text-[#5D0D18] transition
                ${expanded ? "justify-start" : "justify-center"}`}
            >
              <ChevronRight
                size={18}
                className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
              {expanded && <span className="text-xs">Collapse</span>}
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE BOTTOM NAV */}
      {!isAuthPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden
          bg-[#FFF9EB]/95 backdrop-blur-md border-t border-[#9FB2AC]/30 px-2 py-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition
                  ${isActive
                    ? "text-[#5D0D18] font-medium"
                    : "text-[#9FB2AC] hover:text-[#5D0D18]"
                  }`}
              >
                <Icon size={20} />
                <span className="text-[10px] leading-tight">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}