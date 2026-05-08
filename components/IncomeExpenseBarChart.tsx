"use client";

import ChartTooltip from "@/components/ChartTooltip";

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
        style={{
          background: "#7EF7C9",
        }}
      />

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Income vs Expenses
        </h2>

        <p className="text-sm text-white/60">
          Overview of your cashflow
        </p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>

            {/* X Axis */}
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            />

            {/* Y Axis */}
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            />

            <Tooltip content={<ChartTooltip />} />

            {/* Income */}
            <Bar
              dataKey="income"
              fill="#7EF7C9"
              radius={[10, 10, 0, 0]}
              animationDuration={700}
            />

            {/* Expenses */}
            <Bar
              dataKey="expenses"
              fill="#FF9B9B"
              radius={[10, 10, 0, 0]}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}