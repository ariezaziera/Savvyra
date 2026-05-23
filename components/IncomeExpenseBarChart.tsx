"use client";

import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Data = {
  name: string;
  income: number;
  expenses: number;
};

type Props = {
  data: Data[];
};

export default function IncomeExpenseBarChart({ data }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl
      border border-white/15
      bg-white/8
      p-5
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
    >
      {/* top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      {/* glow orb */}
      <div
        className="pointer-events-none absolute -right-10 -top-10
        h-32 w-32 rounded-full blur-3xl opacity-20"
        style={{ background: "#7EF7C9" }}
      />

      {/* Header row — title + export button */}
      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Income vs Expenses</h2>
          <p className="text-sm text-white/60">Overview of your cashflow</p>
        </div>
        <ChartExportMenu
          chartId="income-expense-bar-chart"
          filename="income_vs_expenses"
        />
      </div>

      {/* Exported region — paddingBottom supaya legend tak kena crop */}
      <div id="income-expense-bar-chart" style={{ paddingBottom: 16 }}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              />

              <Tooltip content={<ChartTooltip />} />

              <Bar
                dataKey="income"
                fill="#E8C97A"
                radius={[10, 10, 0, 0]}
                animationDuration={700}
              />
              <Bar
                dataKey="expenses"
                fill="#FF9B9B"
                radius={[10, 10, 0, 0]}
                animationDuration={700}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend — extra marginTop supaya ada gap dari chart */}
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
      </div>{/* end #income-expense-bar-chart */}
    </section>
  );
}