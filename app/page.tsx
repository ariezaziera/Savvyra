"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import PageContainer from "@/components/PageContainer";
import { formatCurrency } from "@/lib/formatCurrency";
import ExpenseCategoryChart from "@/components/ExpenseCategoryChart";
import IncomeExpenseBarChart from "@/components/IncomeExpenseBarChart";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { motion } from "framer-motion";
import SavingsGoalsCarousel from "@/components/SavingsGoalsCarousel";

type DashboardData = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  cashSavings: number;
  goldSavings: number;
  expenseByCategory: { name: string; value: number }[];
  incomeExpenseSummary: {
    name: string;
    income: number;
    expenses: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    cashSavings: 0,
    goldSavings: 0,
    expenseByCategory: [],
    incomeExpenseSummary: [],
    monthlyTrend: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [completionToast, setCompletionToast] = useState("");
  const [goals, setGoals] = useState<any[]>([]);

  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);

      const [dashboardRes, goalsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/savings-goals"),
      ]);

      const data = await dashboardRes.json();
      const goalsData = await goalsRes.json();

      setDashboardData(data);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (goals.length === 0) return;

    goals.forEach((goal: any) => {
      const progress =
        goal.targetAmount > 0
          ? goal.currentAmount / goal.targetAmount
          : 0;

      const storageKey = `savvyra-goal-completed-${goal.id}`;

      if (progress >= 1 && !localStorage.getItem(storageKey)) {
        setCompletionToast(`${goal.name} completed 🎉`);

        localStorage.setItem(storageKey, "true");

        setTimeout(() => {
          setCompletionToast("");
        }, 3000);
      }
    });
  }, [goals]);

  const stats = [
    {
      label: "Balance",
      value: dashboardData.balance,
      color: "text-[#C6E6FF]",
    },
    {
      label: "Income",
      value: dashboardData.income,
      color: "text-[#7EF7C9]",
    },
    {
      label: "Expenses",
      value: dashboardData.expenses,
      color: "text-[#FF9B9B]",
    },
    {
      label: "Total Savings",
      value: dashboardData.savings,
      color: "text-[#CFA8FF]",
    },
  ];

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) return;

    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: goalName,
        targetAmount: goalTarget,
        currentAmount: 0,
        deadline: null,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to add goal:", error);
    } else {
      await res.json();

      setGoalName("");
      setGoalTarget("");

      await fetchDashboard();
    }
  };

  return (
    <PageContainer>
      <>
        {/* Aurora Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Noise Texture */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-soft-light bg-[url('/noise.png')]" />

        <style jsx>{`
          .blob {
            position: fixed;
            border-radius: 9999px;
            pointer-events: none;
            z-index: 0;
            will-change: transform;
          }

          .blob-1 {
            width: 500px;
            height: 500px;
            background: #6a49fa;
            top: -150px;
            left: -150px;
            filter: blur(120px);
            opacity: 0.85;
            animation: blob-drift-1 12s ease-in-out infinite alternate;
          }

          .blob-2 {
            width: 450px;
            height: 450px;
            background: #c6e6ff;
            bottom: -100px;
            right: -100px;
            filter: blur(110px);
            opacity: 0.55;
            animation: blob-drift-2 15s ease-in-out infinite alternate;
          }

          .blob-3 {
            width: 380px;
            height: 380px;
            background: #fedada;
            top: 30%;
            right: 10%;
            filter: blur(100px);
            opacity: 0.45;
            animation: blob-drift-3 10s ease-in-out infinite alternate;
          }

          @keyframes blob-drift-1 {
            from {
              transform: translate(0, 0) scale(1);
            }

            to {
              transform: translate(40px, 60px) scale(1.1);
            }
          }

          @keyframes blob-drift-2 {
            from {
              transform: translate(0, 0) scale(1);
            }

            to {
              transform: translate(-50px, -40px) scale(1.08);
            }
          }

          @keyframes blob-drift-3 {
            from {
              transform: translate(0, 0) scale(1);
            }

            to {
              transform: translate(30px, -50px) scale(0.95);
            }
          }
        `}</style>

        {/* Background */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#5B3FC4_0%,#453284_45%,#1D1238_100%)]" />

        {/* Completion Toast */}
        {completionToast && (
          <div
            className="fixed right-5 top-5 z-50 rounded-2xl
            border border-white/25
            bg-white/20
            px-5 py-3 text-sm font-medium text-white
            backdrop-blur-xl
            shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
          >
            {completionToast}
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">
            Personal Finance Overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Savvyra Dashboard
          </h1>

          <p className="mt-2 text-sm text-white/80">
            Monitor your balance, savings progress, and financial trends.
          </p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
            }}
            className="relative z-10 space-y-6"
          >
            {/* Stats */}
            <DashboardStats
              stats={stats}
              formatCurrency={formatCurrency}
            />

            {/* Savings Cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/25
                bg-white/16
                p-6
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

                <p className="text-sm text-white/80">
                  Cash Savings
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {formatCurrency(dashboardData.cashSavings)}
                </h2>
              </div>

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/25
                bg-white/16
                p-6
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

                <p className="text-sm text-white/80">
                  Gold Savings
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {formatCurrency(dashboardData.goldSavings)}
                </h2>
              </div>
            </section>

            <SavingsGoalsCarousel goals={goals} />

            {/* Add Goal */}
            <section
              className="relative overflow-hidden rounded-3xl
              border border-white/25
              bg-white/16
              p-6
              backdrop-blur-xl
              shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Add Savings Goal
                  </h2>

                  <p className="mt-1 text-sm text-white/75">
                    Set a new target and track your financial progress.
                  </p>
                </div>

                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Goal name"
                  className="w-full rounded-2xl border border-white/25
                  bg-white/10
                  px-4 py-3 text-sm text-white
                  outline-none placeholder:text-white/45
                  backdrop-blur-xl
                  focus:border-[#6A49FA]
                  focus:ring-2 focus:ring-[#6A49FA]/20"
                />

                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Target amount"
                  className="w-full rounded-2xl border border-white/25
                  bg-white/10
                  px-4 py-3 text-sm text-white
                  outline-none placeholder:text-white/45
                  backdrop-blur-xl
                  focus:border-[#6A49FA]
                  focus:ring-2 focus:ring-[#6A49FA]/20"
                />

                <button
                  onClick={handleAddGoal}
                  className="w-full rounded-2xl
                  bg-[#6A49FA]
                  px-5 py-3 text-sm font-medium text-white
                  transition-all duration-200
                  hover:bg-[#7B5BFF]
                  hover:scale-[1.01]
                  active:scale-[0.99]
                  shadow-[0_8px_24px_rgba(106,73,250,0.35)]"
                >
                  Add Goal
                </button>
              </div>
            </section>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/25
                bg-white/16
                p-4
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

                <ExpenseCategoryChart
                  data={dashboardData.expenseByCategory}
                />
              </div>

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/25
                bg-white/16
                p-4
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

                <IncomeExpenseBarChart
                  data={dashboardData.incomeExpenseSummary}
                />
              </div>
            </div>

            {/* Monthly Trend */}
            <div
              className="relative overflow-hidden rounded-3xl
              border border-white/25
              bg-white/16
              p-4
              backdrop-blur-xl
              shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

              <MonthlyTrendChart
                data={dashboardData.monthlyTrend}
              />
            </div>
          </motion.div>
        )}
      </>
    </PageContainer>
  );
}
