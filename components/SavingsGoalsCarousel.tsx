"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Goal = {
  name: string;
  current: number;
  target: number;
};

type Props = {
  goals: Goal[];
};

export default function SavingsGoalsCarousel({ goals }: Props) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Savings Goals
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {goals.map((goal, index) => {
          const progress = Math.min(goal.current / goal.target, 1);

          const data = [
            { name: "Progress", value: progress },
            { name: "Remaining", value: 1 - progress },
          ];

          return (
            <div
              key={goal.name}
              className="min-w-[220px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{goal.name}</p>

              {/* Donut */}
              <div className="mt-4 h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      innerRadius={40}
                      outerRadius={55}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#2563EB" />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Percentage */}
              <p className="mt-2 text-center text-sm font-semibold text-gray-900">
                {(progress * 100).toFixed(0)}%
              </p>

              {/* Amount */}
              <p className="mt-1 text-center text-xs text-gray-500">
                RM {goal.current.toLocaleString()} / RM{" "}
                {goal.target.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}