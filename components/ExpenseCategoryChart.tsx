"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import ChartTooltip from "@/components/ChartTooltip";

type CategoryData = {
  name: string;
  value: number;
};

type ExpenseCategoryChartProps = {
  data?: CategoryData[];
};

const COLORS = ["#2563EB", "#60A5FA", "#93C5FD", "#DBEAFE", "#CBD5E1"];


export default function ExpenseCategoryChart({
  data = [],
}: ExpenseCategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Expense Breakdown
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          No expense data yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Expense Breakdown
        </h2>
        <p className="text-sm text-gray-500">
          Spending distribution by category
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              activeIndex={activeIndex}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>

            <span className="text-sm font-medium text-gray-900">
              RM {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}