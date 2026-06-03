"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  data: {
    totalInvested: number;
    totalCurrentValue: number;
    gainLoss: number;
    gainLossPct: number;
    count: number;
  };
};

export default function InvestmentsWidget({ data }: Props) {
  if (data.count === 0) return null;

  const isGain = data.gainLoss >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#93C5FD]/15 bg-[#93C5FD]/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[#93C5FD]/20" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35 font-medium">Portfolio</p>
          <h3 className="text-base font-bold text-white mt-0.5">Investments</h3>
        </div>
        <Link href="/investments" className="flex items-center gap-1 text-xs text-white/35 hover:text-[#93C5FD] transition">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <p className="text-3xl font-bold text-[#93C5FD] mb-1">{formatCurrency(data.totalCurrentValue)}</p>
      <p className="text-xs text-white/35 mb-4">current value · {data.count} {data.count === 1 ? "holding" : "holdings"}</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">Invested</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(data.totalInvested)}</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 border ${isGain ? "bg-[#8EE3B5]/10 border-[#8EE3B5]/20" : "bg-[#FF8C8C]/10 border-[#FF8C8C]/20"}`}>
          {isGain ? <TrendingUp size={13} className="text-[#8EE3B5]" /> : <TrendingDown size={13} className="text-[#FF8C8C]" />}
          <span className={`text-xs font-semibold ${isGain ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>
            {isGain ? "+" : ""}{formatCurrency(data.gainLoss)} ({data.gainLossPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}
