"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
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
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0
            ? Math.min(goal.currentAmount / goal.targetAmount, 1)
            : 0;
          const isCompleted = progress >= 1;

          const data = [
            { name: "Progress", value: progress },
            { name: "Remaining", value: 1 - progress },
          ];

          return (
            <div
              key={goal.id}
              className={`min-w-55 rounded-2xl border bg-white p-4 mt-2 ml-2 shadow-sm transition-all duration-500 ${
                isCompleted
                  ? "border-green-300 shadow-green-100 scale-[1.02]"
                  : "border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-500">{goal.name}</p>

              {isCompleted && (
                <p className="mt-1 text-xs font-medium text-green-600">
                  Goal completed 🎉
                </p>
              )}

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
                      <Cell fill={isCompleted ? "#16A34A" : "#2563EB"} />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-2 text-center text-sm font-semibold text-gray-900">
                {(progress * 100).toFixed(0)}%
              </p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    progress >= 1 ? "bg-green-600" : "bg-blue-600"
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <p className="mt-1 text-center text-xs text-gray-500">
                RM {goal.currentAmount.toLocaleString()} / RM {goal.targetAmount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}