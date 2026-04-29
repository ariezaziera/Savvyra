import { StatItem } from "@/lib/dashboardData";

type DashboardStatsProps = {
  stats: StatItem[];
  formatCurrency: (amount: number) => string;
};

export default function DashboardStats({
  stats,
  formatCurrency,
}: DashboardStatsProps) {
  const savings = stats.find((item) => item.label === "Savings")?.value || 0;
  const expenses = stats.find((item) => item.label === "Expenses")?.value || 0;

  const total = savings + expenses;
  const savingsPercent = total ? (savings / total) * 100 : 0;
  const expensesPercent = total ? (expenses / total) * 100 : 0;

  const dominantColor =
    savings > expenses
      ? "border-blue-500"
      : expenses > savings
      ? "border-rose-400"
      : "border-gray-300";

  const glowColor =
    savings > expenses
      ? "shadow-blue-200"
      : expenses > savings
      ? "shadow-rose-200"
      : "shadow-gray-200";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {stats.map(({ label, value, color }) => {
        const isBalance = label === "Balance";

        return (
          <div
            key={label}
            className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md space-y-1 ${
              isBalance ? "row-span-2" : ""
            }`}
          >
            <p className="text-sm text-gray-500">{label}</p>

            <h2 className={`text-2xl font-semibold ${color}`}>
              {formatCurrency(value)}
            </h2>

            {isBalance && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Savings vs Expenses</span>
                  <span className="font-medium text-gray-700">
                    {savingsPercent.toFixed(0)}% / {expensesPercent.toFixed(0)}%
                  </span>
                </div>

                <div className="relative flex h-3 w-full rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-l-full bg-linear-to-r from-blue-600 to-blue-200"
                    style={{ width: `${savingsPercent}%` }}
                  ></div>

                  <div
                    className="h-full rounded-r-full bg-linear-to-r from-rose-200 to-rose-400"
                    style={{ width: `${expensesPercent}%` }}
                  ></div>

                  <div
                    className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white transition-all duration-300 ${dominantColor} ${glowColor} shadow-sm`}
                    style={{
                      left: `${savingsPercent}%`,
                      boxShadow:
                        savings > expenses
                          ? "0 0 6px rgba(59,130,246,0.3)"
                          : expenses > savings
                          ? "0 0 6px rgba(244,63,94,0.3)"
                          : "0 0 6px rgba(156,163,175,0.3)",
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Savings: {formatCurrency(savings)}</span>
                  <span>Expenses: {formatCurrency(expenses)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}