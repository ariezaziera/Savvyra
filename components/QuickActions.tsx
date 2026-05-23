"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HandCoins,
  UserCircle,
  Wallet,
  TrendingUp,
  Bell,
  ShieldCheck,
} from "lucide-react";

type QuickAction = {
  label: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  glow: string;
  soon?: boolean;
};

const actions: QuickAction[] = [
  {
    label: "Commitments",
    subtitle: "Bills & subscriptions",
    href: "/commitments",
    icon: HandCoins,
    gradient: "from-[#C4B5FD]/20 to-[#6A49FA]/10",
    iconColor: "text-[#C4B5FD]",
    glow: "rgba(196,181,253,0.25)",
  },
  {
    label: "Profile",
    subtitle: "Account & info",
    href: "/profile",
    icon: UserCircle,
    gradient: "from-[#8EE3B5]/20 to-[#4ade80]/10",
    iconColor: "text-[#8EE3B5]",
    glow: "rgba(142,227,181,0.20)",
  },
  {
    label: "Salary",
    subtitle: "Calculate & manage",
    href: "/salary",
    icon: Wallet,
    gradient: "from-[#6A49FA]/30 to-[#9B7FFF]/20",
    iconColor: "text-[#C4B5FD]",
    glow: "rgba(106,73,250,0.35)",
  },
  {
    label: "Investments",
    subtitle: "Track your portfolio",
    href: "/investments",
    icon: TrendingUp,
    gradient: "from-[#93C5FD]/20 to-[#3b82f6]/10",
    iconColor: "text-[#93C5FD]",
    glow: "rgba(147,197,253,0.20)",
    soon: true,
  },
  {
    label: "Notifications",
    subtitle: "Alerts & reminders",
    href: "/notifications",
    icon: Bell,
    gradient: "from-[#FBD38D]/20 to-[#f59e0b]/10",
    iconColor: "text-[#FBD38D]",
    glow: "rgba(251,211,141,0.20)",
    soon: true,
  },
];

export default function QuickActions() {
  return (
    // ✅ Buang z-index dari section ni — jangan create stacking context baru
    <section style={{ position: "static" }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quick Access</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ label, subtitle, href, icon: Icon, gradient, iconColor, glow, soon }, i) => (
          // ✅ Buang motion.div wrapper yang create stacking context — guna CSS animation je
          <div
            key={label}
            style={{
              opacity: 0,
              animation: `fadeSlideUp 0.35s ease-out ${i * 0.06}s forwards`,
            }}
          >
            <style>{`
              @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(10px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <Link
              href={soon ? "#" : href}
              onClick={soon ? (e) => e.preventDefault() : undefined}
              className={`relative flex flex-col items-center justify-center gap-2.5 rounded-3xl border border-white/10 bg-linear-to-br ${gradient} p-4 text-center backdrop-blur-xl transition-all duration-200 overflow-hidden
                ${soon
                  ? "cursor-not-allowed opacity-60"
                  : "hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.97]"
                }`}
              style={{
                boxShadow: soon ? "none" : `0 4px 24px ${glow}`,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <Icon size={20} className={iconColor} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{label}</p>
                <p className="mt-0.5 text-[10px] text-white/40 leading-tight hidden sm:block">{subtitle}</p>
              </div>
              {soon && (
                <span className="absolute top-2 right-2 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-medium text-white/50 uppercase tracking-wider">
                  Soon
                </span>
              )}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}