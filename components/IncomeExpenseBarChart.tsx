"use client";

import { useRouter } from "next/navigation";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import { BarChart2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Data = { name: string; income: number; expenses: number };

export default function IncomeExpenseBarChart({ data }: { data: Data[] }) {
  const router = useRouter();
  const isEmpty = !data || data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Income vs Expenses</h2>
          <p className="text-xs text-white/45 mt-0.5">Overview of your cashflow</p>
        </div>
        {!isEmpty && <ChartExportMenu chartId="income-expense-bar-chart" filename="income_vs_expenses" />}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
            <BarChart2 size={20} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No transactions yet</p>
            <p className="text-xs text-white/30 mt-1">Add your first transaction to see cashflow</p>
          </div>
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-2xl border border-white/12 bg-white/6 px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            Add Transaction →
          </button>
        </div>
      ) : (
        <div id="income-expense-bar-chart" style={{ paddingBottom: 16 }}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="35%">
                <XAxis dataKey="name" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)", radius: 8 }} />
                <Bar dataKey="income" fill="#E8C97A" radius={[8, 8, 0, 0]} animationDuration={700} />
                <Bar dataKey="expenses" fill="#FF9B9B" radius={[8, 8, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E8C97A]" />
              <span className="text-xs text-white/50">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF9B9B]" />
              <span className="text-xs text-white/50">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
