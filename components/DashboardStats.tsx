import { StatItem } from "@/lib/dashboardData";

type DashboardStatsProps = {
  stats: StatItem[];
  formatCurrency: (amount: number) => string;
};

export default function DashboardStats({
  stats,
  formatCurrency,
}: DashboardStatsProps) {

  const savings =
    stats.find((item) => item.label === "Total Savings")?.value || 0;

  const expenses =
    stats.find((item) => item.label === "Expenses")?.value || 0;

  const total = savings + expenses;

  const savingsPercent =
    total ? (savings / total) * 100 : 0;

  const expensesPercent =
    total ? (expenses / total) * 100 : 0;

  const dominantBorder =
    savings > expenses
      ? "border-[#7EF7C9]"
      : expenses > savings
      ? "border-[#FF9B9B]"
      : "border-white/40";

  const dominantGlow =
    savings > expenses
      ? "0 0 12px rgba(126,247,201,0.55)"
      : expenses > savings
      ? "0 0 12px rgba(255,155,155,0.55)"
      : "0 0 12px rgba(255,255,255,0.30)";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      {stats.map(({ label, value, color }) => {

        const isBalance = label === "Balance";

        return (
          <div
            key={label}
            className={`relative overflow-hidden rounded-3xl
              border border-white/25
              bg-white/[0.16]
              p-5
              backdrop-blur-xl
              shadow-[0_10px_40px_rgba(0,0,0,0.28)]
              transition-all duration-300
              hover:bg-white/[0.20]
              hover:shadow-[0_14px_50px_rgba(0,0,0,0.35)]
              ${isBalance ? "row-span-2" : ""}`}
          >

            {/* Top Reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

            {/* Glow Orb */}
            <div
              className="pointer-events-none absolute -right-10 -top-10
              h-28 w-28 rounded-full blur-3xl opacity-30"
              style={{
                background:
                  label === "Balance"
                    ? "#C6E6FF"
                    : label === "Income"
                    ? "#7EF7C9"
                    : label === "Expenses"
                    ? "#FF9B9B"
                    : "#CFA8FF",
              }}
            />

            {/* Label */}
            <p className="relative z-10 text-sm text-white/80">
              {label}
            </p>

            {/* Amount */}
            <h2
              className={`relative z-10 mt-2 text-3xl font-semibold tracking-tight ${color}`}
            >
              {formatCurrency(value)}
            </h2>

            {/* Balance Extra Section */}
            {isBalance && (
              <div className="relative z-10 space-y-4 pt-5">

                {/* Top Text */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/65">
                    Savings vs Expenses
                  </span>

                  <span className="font-medium text-white/90">
                    {savingsPercent.toFixed(0)}% /{" "}
                    {expensesPercent.toFixed(0)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className="relative flex h-3 w-full overflow-hidden rounded-full
                  bg-white/[0.12]"
                >

                  {/* Savings */}
                  <div
                    className="h-full bg-linear-to-r from-[#6A49FA] to-[#C6E6FF]"
                    style={{ width: `${savingsPercent}%` }}
                  />

                  {/* Expenses */}
                  <div
                    className="h-full bg-linear-to-r from-[#FFB3B3] to-[#FF6B6B]"
                    style={{ width: `${expensesPercent}%` }}
                  />

                  {/* Indicator */}
                  <div
                    className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white transition-all duration-300 ${dominantBorder}`}
                    style={{
                      left: `${savingsPercent}%`,
                      boxShadow: dominantGlow,
                    }}
                  />
                </div>

                {/* Bottom Stats */}
                <div className="flex justify-between text-xs text-white/65">
                  <span>
                    Savings: {formatCurrency(savings)}
                  </span>

                  <span>
                    Expenses: {formatCurrency(expenses)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
