"use client";

import ChartTooltip from "@/components/ChartTooltip";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Data = {
  month: string;
  income: number;
  expenses: number;
};

type Props = {
  data: Data[];
};

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl
      border border-white/15
      bg-white/8
      p-5
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
    >
      {/* top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      {/* glow orb */}
      <div
        className="pointer-events-none absolute -left-10 -top-10
        h-32 w-32 rounded-full blur-3xl opacity-20"
        style={{
          background: "#CFA8FF",
        }}
      />

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Monthly Trend
        </h2>

        <p className="text-sm text-white/60">
          Track your income and expenses over time
        </p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            {/* X Axis */}
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            />

            {/* Y Axis */}
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            />

            <Tooltip content={<ChartTooltip />} />

            {/* Income line */}
            <Line
              type="monotone"
              dataKey="income"
              stroke="#E8C97A"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#E8C97A" }}
              activeDot={{ r: 6 }}
              animationDuration={700}
            />

            {/* Expenses line */}
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#FF9B9B"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#FF9B9B" }}
              activeDot={{ r: 6 }}
              animationDuration={700}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}