"use client";

import { useRouter } from "next/navigation";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import { TrendingUp } from "lucide-react";

type Data = { month: string; income: number; expenses: number };
type Props = { data: Data[] };

export default function MonthlyTrendChart({ data }: Props) {
  const router = useRouter();
  const isEmpty = !data || data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0);

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Monthly Trend</h2>
          <p className="text-sm text-white/45">Income and expenses over time</p>
        </div>
        {!isEmpty && <ChartExportMenu chartId="monthly-trend-chart" filename="monthly_trend" />}
      </div>

      {isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
            <TrendingUp size={24} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No trend data yet</p>
            <p className="text-xs text-white/30 mt-1">Your monthly trend will appear once you start tracking</p>
          </div>
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-2xl border border-white/15 bg-white/8 px-5 py-2 text-xs font-semibold text-white/70 hover:bg-white/12 hover:text-white transition-all"
          >
            Add Transaction →
          </button>
        </div>
      ) : (
        <div id="monthly-trend-chart" style={{ paddingBottom: 16 }}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#C4B5FD" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#E8A0A0" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#E8A0A0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }} />
                <YAxis stroke="transparent" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#C4B5FD" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 5, fill: "#C4B5FD", strokeWidth: 0 }} animationDuration={800} />
                <Area type="monotone" dataKey="expenses" stroke="#E8A0A0" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 5, fill: "#E8A0A0", strokeWidth: 0 }} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5" style={{ marginTop: 20 }}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C4B5FD]" />
              <span className="text-xs text-white/50">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E8A0A0]" />
              <span className="text-xs text-white/50">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
