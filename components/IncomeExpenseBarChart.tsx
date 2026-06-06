"use client";

import { useRouter } from "next/navigation";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import { PlusCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Data = { name: string; income: number; expenses: number };
type Props = { data: Data[] };

export default function IncomeExpenseBarChart({ data }: Props) {
  const router = useRouter();
  const isEmpty = !data || data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/8 p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20" style={{ background: "#7EF7C9" }} />

      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Income vs Expenses</h2>
          <p className="text-sm text-white/60">Overview of your cashflow</p>
        </div>
        {!isEmpty && <ChartExportMenu chartId="income-expense-bar-chart" filename="income_vs_expenses" />}
      </div>

      {isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
            <PlusCircle size={24} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No transactions yet</p>
            <p className="text-xs text-white/30 mt-1">Add your first transaction to see cashflow</p>
          </div>
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-2xl border border-white/15 bg-white/8 px-5 py-2 text-xs font-semibold text-white/70 hover:bg-white/12 hover:text-white transition-all"
          >
            Add Transaction →
          </button>
        </div>
      ) : (
        <div id="income-expense-bar-chart" style={{ paddingBottom: 16 }}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" fill="#E8C97A" radius={[10, 10, 0, 0]} animationDuration={700} />
                <Bar dataKey="expenses" fill="#FF9B9B" radius={[10, 10, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5" style={{ marginTop: 20 }}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E8C97A]" />
              <span className="text-xs text-white/60">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF9B9B]" />
              <span className="text-xs text-white/60">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
