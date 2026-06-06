"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  data: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    nextDue: { name: string; date: string; amount: number } | null;
    overdueList: { name: string; amount: number; date: string }[];
  };
};

export default function CommitmentsWidget({ data }: Props) {
  const paidPct = data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0;
  const remainingAmt = data.totalAmount - data.paidAmount;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35 font-medium">This Month</p>
          <h3 className="text-base font-bold text-white mt-0.5">Commitments</h3>
        </div>
        <Link href="/commitments" className="flex items-center gap-1 text-xs text-white/35 hover:text-[#C4B5FD] transition">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/45">{data.paid}/{data.total} paid</span>
          <span className="text-white/45">{paidPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${paidPct}%`,
              background: paidPct === 100 ? "#8EE3B5" : "linear-gradient(90deg, #6A49FA, #9B7FFF)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-[#8EE3B5]">{formatCurrency(data.paidAmount)} paid</span>
          <span className="text-white/40">{formatCurrency(remainingAmt)} left</span>
        </div>
      </div>

      {/* Overdue alert */}
      {data.overdue > 0 && (
        <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-[#FF8C8C]/25 bg-[#FF8C8C]/10 px-3.5 py-2.5">
          <AlertTriangle size={14} className="text-[#FF8C8C] shrink-0" />
          <p className="text-xs text-[#FF8C8C] font-medium">
            {data.overdue} overdue — {data.overdueList.map((o) => o.name).join(", ")}
          </p>
        </div>
      )}

      {/* Next due */}
      {data.nextDue ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 px-3.5 py-2.5">
          <Clock size={14} className="text-[#FBD38D] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 truncate font-medium">{data.nextDue.name}</p>
            <p className="text-[10px] text-white/35">{new Date(data.nextDue.date).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</p>
          </div>
          <span className="text-xs font-semibold text-white shrink-0">{formatCurrency(data.nextDue.amount)}</span>
        </div>
      ) : data.total > 0 ? (
        <div className="flex items-center gap-2 text-xs text-[#8EE3B5]">
          <CheckCircle2 size={14} /> All commitments settled this month!
        </div>
      ) : (
        <p className="text-xs text-white/30">No commitments this month.</p>
      )}
    </div>
  );
}