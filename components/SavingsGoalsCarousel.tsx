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
    <section className="mt-2">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Savings Goals
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2">

        {goals.map((goal) => {
          const progress =
            goal.targetAmount > 0
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
              className={`relative min-w-60 overflow-hidden
                rounded-3xl border
                bg-white/8
                p-5
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.28)]
                transition-all duration-300
                hover:scale-[1.02]
                hover:bg-white/10
                ${
                  isCompleted
                    ? "border-[#7EF7C9]"
                    : "border-white/15"
                }`}
            >

              {/* Top reflection line */}
              <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

              {/* Glow orb */}
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl opacity-30`}
                style={{
                  background: isCompleted
                    ? "#7EF7C9"
                    : "#6A49FA",
                }}
              />

              {/* Title */}
              <p className="relative z-10 text-sm text-white/65">
                {goal.name}
              </p>

              {isCompleted && (
                <p className="relative z-10 mt-1 text-xs font-medium text-[#7EF7C9]">
                  Goal completed 🎉
                </p>
              )}

              {/* Chart */}
              <div className="relative z-10 mt-4 h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={58}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={isCompleted ? "#7EF7C9" : "#6A49FA"} />
                      <Cell fill="rgba(255,255,255,0.08)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Percentage */}
              <p className="relative z-10 mt-2 text-center text-sm font-semibold text-white">
                {(progress * 100).toFixed(0)}%
              </p>

              {/* Progress bar */}
              <div className="relative z-10 mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCompleted
                      ? "bg-[#7EF7C9]"
                      : "bg-[#6A49FA]"
                  }`}
                  style={{
                    width: `${progress * 100}%`,
                  }}
                />
              </div>

              {/* Amount */}
              <p className="relative z-10 mt-2 text-center text-xs text-white/60">
                RM {goal.currentAmount.toLocaleString()} /{" "}
                RM {goal.targetAmount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}