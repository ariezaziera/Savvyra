"use client";

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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Monthly Trend
        </h2>
        <p className="text-sm text-gray-500">
          Track your income and expenses over time
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#F43F5E"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}