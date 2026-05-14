"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import ChartTooltip from "@/components/ChartTooltip";

type Data = { month: string; income: number; expenses: number };
type Props = { data: Data[] };

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Monthly Trend</h2>
        <p className="text-sm text-white/45">Income and expenses over time</p>
      </div>

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

            <XAxis
              dataKey="month"
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
            />

            <Tooltip content={<ChartTooltip />} />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#C4B5FD"
              strokeWidth={2.5}
              fill="url(#incomeGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#C4B5FD", strokeWidth: 0 }}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#E8A0A0"
              strokeWidth={2.5}
              fill="url(#expenseGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#E8A0A0", strokeWidth: 0 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C4B5FD]" />
          <span className="text-xs text-white/50">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8A0A0]" />
          <span className="text-xs text-white/50">Expenses</span>
        </div>
      </div>
    </section>
  );
}