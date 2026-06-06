"use client";

import { useRouter } from "next/navigation";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import { TrendingUp } from "lucide-react";

type Data = { month: string; income: number; expenses: number };

export default function MonthlyTrendChart({ data }: { data: Data[] }) {
  const router = useRouter();
  const isEmpty = !data || data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Monthly Trend</h2>
          <p className="text-xs text-white/45 mt-0.5">Income and expenses over time</p>
        </div>
        {!isEmpty && <ChartExportMenu chartId="monthly-trend-chart" filename="monthly_trend" />}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
            <TrendingUp size={20} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No trend data yet</p>
            <p className="text-xs text-white/30 mt-1">Your monthly trend appears once you start tracking</p>
          </div>
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-2xl border border-white/12 bg-white/6 px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            Add Transaction →
          </button>
        </div>
      ) : (
        <div id="monthly-trend-chart" style={{ paddingBottom: 16 }}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8A0A0" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#E8A0A0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#C4B5FD" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: "#C4B5FD", strokeWidth: 0 }} animationDuration={800} />
                <Area type="monotone" dataKey="expenses" stroke="#E8A0A0" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: "#E8A0A0", strokeWidth: 0 }} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C4B5FD]" />
              <span className="text-xs text-white/50">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E8A0A0]" />
              <span className="text-xs text-white/50">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
