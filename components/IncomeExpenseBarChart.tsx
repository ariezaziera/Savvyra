"use client";

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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Income vs Expenses
        </h2>
        <p className="text-sm text-gray-500">
          Overview of your cashflow
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />

            <Bar dataKey="income" fill="#2563EB" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}