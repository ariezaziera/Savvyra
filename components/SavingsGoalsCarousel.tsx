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
    <section
      className="relative overflow-hidden rounded-3xl
      border border-white/25
      bg-white/16
      p-6
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
    >
      {/* Top reflection line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">
          Savings Goals
        </h2>
        <p className="mt-1 text-sm text-white/75">
          Track progress toward each of your targets.
        </p>
      </div>

      {/* Scrollable cards */}
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
        {goals.length === 0 && (
          <p className="text-sm text-white/60 py-4">
            No goals yet. Add one below to get started.
          </p>
        )}

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
              className={`relative min-w-60 shrink-0 overflow-hidden
                rounded-2xl border
                bg-white/10
                p-5
                backdrop-blur-xl
                transition-all duration-300
                hover:scale-[1.02]
                hover:bg-white/15
                ${isCompleted ? "border-[#7EF7C9]/60" : "border-white/20"}`}
            >
              {/* Inner top highlight */}
              <div
                className={`absolute inset-x-0 top-0 h-px ${
                  isCompleted ? "bg-[#7EF7C9]/50" : "bg-white/25"
                }`}
              />

              {/* Glow orb */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl opacity-25"
                style={{ background: isCompleted ? "#7EF7C9" : "#6A49FA" }}
              />

              {/* Goal name */}
              <p className="relative z-10 text-sm font-medium text-white/85">
                {goal.name}
              </p>

              {isCompleted && (
                <p className="relative z-10 mt-1 text-xs font-medium text-[#7EF7C9]">
                  Goal completed 🎉
                </p>
              )}

              {/* Donut chart */}
              <div className="relative z-10 mt-4 h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={56}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      <Cell fill={isCompleted ? "#7EF7C9" : "#6A49FA"} />
                      <Cell fill="rgba(255,255,255,0.10)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered percentage overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {(progress * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative z-10 mt-4 h-0.75 w-full overflow-hidden rounded-full bg-white/12`">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCompleted ? "bg-[#7EF7C9]" : "bg-[#6A49FA]"
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {/* Amount */}
              <p className="relative z-10 mt-3 text-xs text-white/65">
                <span className="text-white/90 font-medium">
                  RM {goal.currentAmount.toLocaleString()}
                </span>
                {" "}
                <span className="text-white/45">/</span>
                {" "}
                RM {goal.targetAmount.toLocaleString()}
              </p>

              {/* Deadline */}
              {goal.deadline && (
                <p className="relative z-10 mt-1 text-xs text-white/45">
                  Due {new Date(goal.deadline).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
