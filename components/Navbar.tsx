"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  HandCoins,
  Settings,
  ChevronRight,
  LogOut,
  Wallet,
} from "lucide-react";

const topNavItems = [
  { label: "Home",         href: "/",             icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions",  icon: ArrowLeftRight  },
  { label: "Savings",      href: "/savings",       icon: PiggyBank       },
  { label: "Commitments",  href: "/commitments",   icon: HandCoins       },
];

const bottomNavItems = [
  { label: "Settings",     href: "/settings",      icon: Settings        },
];

const mobileLeft = [
  { label: "Home",         href: "/",             icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions",  icon: ArrowLeftRight  },
];

const mobileRight = [
  { label: "Savings",      href: "/savings",      icon: PiggyBank       },
  { label: "Settings",     href: "/settings",     icon: Settings        },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname() ?? "";
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const isAuthPage =
    pathname === "/login"     ||
    pathname === "/register"  ||
    pathname === "/onboarding";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (isAuthPage) return null;

  const isSalaryActive = pathname === "/salary" || pathname.startsWith("/salary");

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col fixed left-3 top-4 h-[calc(100vh-2rem)] z-50 transition-all duration-300 ease-in-out
          bg-[#2B1E59]/90 backdrop-blur-2xl
          rounded-3xl
          border border-white/12
          shadow-[0_8px_40px_rgba(0,0,0,0.40)]
          ${expanded ? "w-56" : "w-16"}`}
      >
        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-3 pt-5 border-b border-white/10 rounded-full ${
            expanded ? "justify-start" : "justify-center"
          }`}
        >
          <div className="h-8 w-8 shrink-0 flex items-center p-1 justify-center">
            <Image
              src="/logo2.png"
              alt="Savvyra"
              width={32}
              height={32}
              className="h-full w-full object-contain
                        filter drop-shadow-[0_2px_8px_rgba(232,160,160,0.6)]
                        hover:drop-shadow-[0_0_12px_rgba(232,201,122,0.8)]
                        transition-all duration-300"
            />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight">Savvyra</p>
              <p className="text-xs text-white/60">Personal Finance</p>
            </div>
          )}
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
          {topNavItems.map(({ label, href, icon: Icon }) => (
            <NavItem key={label} label={label} href={href} Icon={Icon} isActive={pathname === href} expanded={expanded} />
          ))}

          {/* SALARY — Hero Item */}
          <div className="my-2 px-1">
            {expanded ? (
              <Link
                href="/salary"
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200
                  ${isSalaryActive
                    ? "bg-linear-to-rrom-[#6A49FA] to-[#9B7FFF] text-white shadow-[0_6px_24px_rgba(106,73,250,0.55)]"
                    : "bg-linear-to-r from-[#6A49FA]/25 to-[#9B7FFF]/20 text-[#C4B5FD] border border-[#6A49FA]/40 hover:from-[#6A49FA]/40 hover:to-[#9B7FFF]/35 hover:shadow-[0_4px_16px_rgba(106,73,250,0.35)]"
                  }`}
              >
                <Wallet size={18} className="shrink-0" />
                <div className="overflow-hidden">
                  <span className="block truncate leading-tight">Salary</span>
                  <span className="block text-[10px] font-normal opacity-70 leading-tight">Calculator & Manager</span>
                </div>
              </Link>
            ) : (
              <div className="relative group">
                <Link
                  href="/salary"
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-2xl transition-all duration-200
                    ${isSalaryActive
                      ? "bg-linear-to-br from-[#6A49FA] to-[#9B7FFF] shadow-[0_4px_16px_rgba(106,73,250,0.55)]"
                      : "bg-linear-to-br from-[#6A49FA]/30 to-[#9B7FFF]/25 border border-[#6A49FA]/50 hover:from-[#6A49FA]/50 hover:to-[#9B7FFF]/40"
                    }`}
                >
                  <Wallet size={18} className="text-white" />
                </Link>
                <Tooltip label="Salary Manager" />
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          {bottomNavItems.map(({ label, href, icon: Icon }) => (
            <NavItem key={label} label={label} href={href} Icon={Icon} isActive={pathname === href} expanded={expanded} />
          ))}

          {isLoggedIn && (
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                  text-white/60 hover:bg-white/10 hover:text-white
                  transition-all duration-200
                  ${expanded ? "justify-start" : "justify-center"}`}
              >
                <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {expanded && <span>Logout</span>}
              </button>
              {!expanded && <Tooltip label="Logout" />}
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
              text-white/50 hover:bg-white/10 hover:text-white transition
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

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-50 flex md:hidden items-center
        bg-[#2B1E59]/90 backdrop-blur-2xl rounded-3xl
        border border-white/12
        shadow-[0_8px_40px_rgba(0,0,0,0.40)]
        px-2 py-4"
      >
        {/* Left Side — Home, Transactions */}
        {mobileLeft.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition
                ${isActive ? "text-white font-medium" : "text-white/45 hover:text-white"}`}
            >
              <Icon size={20} />
            </Link>
          );
        })}

        {/* Center — Settings Hero Button */}
        <div className="flex flex-col items-center justify-center px-3">
          <Link
            href="/salary"
            className={`w-18 h-18 rounded-full flex flex-col items-center justify-center gap-0.5 -mt-10
              shadow-[0_8px_28px_rgba(106,73,250,0.55)]
              hover:scale-105 active:scale-95 transition-all duration-200
              ${isSalaryActive
                ? "bg-[#453284]"
                : "bg-linear-to-br from-[#6A49FA] to-[#9B7FFF]"
              }`}
          >
            <Wallet size={22} className="text-white" />
          </Link>
        </div>

        {/* Right Side — Savings, Commitments */}
        {mobileRight.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition
                ${isActive ? "text-white font-medium" : "text-white/45 hover:text-white"}`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavItem({
  label, href, Icon, isActive, expanded,
}: {
  label: string; href: string; Icon: any; isActive: boolean; expanded: boolean;
}) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
          ${isActive
            ? "bg-[#6A49FA]/30 text-[#C4B5FD] shadow-[inset_0_0_0_1px_rgba(196,181,253,0.3)]"
            : "text-white/60 hover:bg-white/10 hover:text-white"
          }
          ${expanded ? "justify-start" : "justify-center"}`}
      >
        <Icon size={18} className="shrink-0" />
        {expanded && <span className="truncate">{label}</span>}
      </Link>
      {!expanded && <Tooltip label={label} />}
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="relative bg-[#2B1E59] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/10">
        {label}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[#2B1E59]" />
      </div>
    </div>
  );
}