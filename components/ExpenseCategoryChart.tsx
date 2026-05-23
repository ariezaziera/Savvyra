"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import ChartTooltip from "@/components/ChartTooltip";
import ChartExportMenu from "@/components/ChartExportMenu";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type CategoryData = {
  name: string;
  value: number;
};

type ExpenseCategoryChartProps = {
  data?: CategoryData[];
};

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const COLORS = [
  "#E8C97A",
  "#E8A0A0",
  "#93C8F0",
  "#E2D9FF",
  "#8EE3B5",
  "#C4B5FD",
  "#FEDADA",
  "#C6E6FF",
];

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export default function ExpenseCategoryChart({
  data = [],
}: ExpenseCategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  /* ── Empty state ── */
  if (!data.length) {
    return (
      <section
        className="relative overflow-hidden rounded-3xl
          border border-white/15
          bg-white/8
          p-5
          backdrop-blur-xl
          shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <h2 className="text-lg font-semibold text-white">Expense Breakdown</h2>
        <p className="mt-2 text-sm text-white/60">No expense data yet.</p>
      </section>
    );
  }

  /* ── Main render ── */
  return (
    <section
      className="relative overflow-hidden rounded-3xl
        border border-white/15
        bg-white/8
        p-5
        backdrop-blur-xl
        shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
    >
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute -left-10 -top-10
          h-32 w-32 rounded-full blur-3xl opacity-20"
        style={{ background: "#6A49FA" }}
      />

      {/* ── Header row — title + export button ── */}
      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Expense Breakdown</h2>
          <p className="text-sm text-white/60">Spending distribution by category</p>
        </div>

        {/* Export button — captures everything inside #expense-category-chart */}
        <ChartExportMenu
          chartId="expense-category-chart"
          filename="expense_breakdown"
        />
      </div>

      {/* ── Exported region — chart + legend ── */}
      <div id="expense-category-chart" style={{ paddingBottom: 16 }}>

        {/* Donut chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend — inside exported div so it's captured with chart */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-white/70">{item.name}</span>
              </div>

              <span className="text-sm font-medium text-white">
                RM {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

      </div>{/* end #expense-category-chart */}
    </section>
  );
}