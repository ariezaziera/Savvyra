"use client";

import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";
import { PieChart as PieIcon } from "lucide-react";

type CategoryData = { name: string; value: number };

const COLORS = [
  "#C4B5FD","#E8C97A","#8EE3B5","#FF9B9B",
  "#93C5FD","#FBD38D","#67E8F9","#F9A8D4",
];

export default function ExpenseCategoryChart({ data = [] }: { data?: CategoryData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const isEmpty = !data || data.length === 0;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Expense Breakdown</h2>
          <p className="text-xs text-white/45 mt-0.5">Spending by category</p>
        </div>
        {!isEmpty && <ChartExportMenu chartId="expense-category-chart" filename="expense_breakdown" />}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
            <PieIcon size={20} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No expense data yet</p>
            <p className="text-xs text-white/30 mt-1">Start tracking to see your breakdown</p>
          </div>
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-2xl border border-white/12 bg-white/6 px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            Add Transaction →
          </button>
        </div>
      ) : (
        <div id="expense-category-chart">
          {/* Donut + center label */}
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  activeIndex={activeIndex}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} opacity={activeIndex === index ? 1 : 0.75} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] text-white/35 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-white leading-tight">
                RM {total.toLocaleString("en-MY", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 space-y-1.5">
            {data.map((item, index) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate text-xs text-white/65">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/35">{pct}%</span>
                    <span className="text-xs font-semibold text-white">RM {item.value.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
