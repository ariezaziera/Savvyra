"use client";

import Link from "next/link";
import { ChevronRight, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  data: {
    totalRemaining: number;
    totalOriginal: number;
    paidPct: number;
    monthlyRepayment: number;
    nextPayment: { name: string; date: Date | string | null; amount: number } | null;
    count: number;
  };
};

export default function DebtWidget({ data }: Props) {
  if (data.count === 0) return null;

  const daysUntilNext = data.nextPayment?.date
    ? Math.ceil((new Date(data.nextPayment.date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#FF8C8C]/15 bg-[#FF8C8C]/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[#FF8C8C]/20" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35 font-medium">Active Debts</p>
          <h3 className="text-base font-bold text-white mt-0.5">Remaining Balance</h3>
        </div>
        <Link href="/debts" className="flex items-center gap-1 text-xs text-white/35 hover:text-[#FF8C8C] transition">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <p className="text-3xl font-bold text-[#FF8C8C] mb-1">{formatCurrency(data.totalRemaining)}</p>
      <p className="text-xs text-white/35 mb-4">of {formatCurrency(data.totalOriginal)} total · {data.paidPct}% paid off</p>

      {/* Pay-off progress */}
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${data.paidPct}%`,
              background: "linear-gradient(90deg, #FF8C8C, #E8A0A0)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/40 mb-3">
        <span>{data.count} active {data.count === 1 ? "debt" : "debts"}</span>
        <span>{formatCurrency(data.monthlyRepayment)}/month repayment</span>
      </div>

      {/* Next payment */}
      {data.nextPayment && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 px-3.5 py-2.5">
          <CalendarClock size={14} className="text-[#FBD38D] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 truncate font-medium">{data.nextPayment.name}</p>
            <p className="text-[10px] text-white/35">
              {daysUntilNext !== null
                ? daysUntilNext === 0 ? "Due today" : daysUntilNext < 0 ? `${Math.abs(daysUntilNext)}d overdue` : `in ${daysUntilNext} days`
                : "Upcoming"}
            </p>
          </div>
          <span className="text-xs font-semibold text-white shrink-0">{formatCurrency(data.nextPayment.amount)}</span>
        </div>
      )}
    </div>
  );
}
