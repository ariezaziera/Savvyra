import { SavingsGoal } from "@/lib/dashboardData";

type SavingsGoalsSectionProps = {
  savingsGoals: SavingsGoal[];
  formatCurrency: (amount: number) => string;
};

export default function SavingsGoalsSection({
  savingsGoals,
  formatCurrency,
}: SavingsGoalsSectionProps) {
  const completedGoals = savingsGoals.filter(
    (goal) => goal.current >= goal.target
  ).length;

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Savings Goals
            </h2>
            <p className="text-sm text-gray-500">
              Track progress across your active goals
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-xs text-gray-500">Active Goals</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                {savingsGoals.length}
              </h3>
            </div>

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-xs text-gray-500">Total Saved</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(totalSaved)}
              </h3>
            </div>

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs text-gray-500">Completed Goals</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                {completedGoals}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {savingsGoals.map((goal) => {
            const progress = goal.target ? (goal.current / goal.target) * 100 : 0;

            return (
              <div
                key={goal.name}
                className="space-y-2 rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{goal.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(goal.current)} /{" "}
                      {formatCurrency(goal.target)}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${goal.color}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500">
                  {progress >= 100
                    ? "Completed"
                    : progress >= 75
                    ? "On track"
                    : progress >= 40
                    ? "In progress"
                    : "Just started"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}