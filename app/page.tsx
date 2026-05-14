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
        setTimeout(() => setCompletionToast(""), 3000);
      }
    });
  }, [goals]);

  const stats = [
    { label: "Balance",       value: dashboardData.balance,  color: "text-[#C4B5FD]" },
    { label: "Income",        value: dashboardData.income,   color: "text-[#8EE3B5]" },
    { label: "Expenses",      value: dashboardData.expenses, color: "text-[#FF8C8C]" },
    { label: "Total Savings", value: dashboardData.savings,  color: "text-[#E2D9FF]" },
  ];

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) return;

    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        {/* Deep background */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#3B1FA8_0%,#1A0F3C_45%,#0D0820_100%)]" />

        {/* Aurora Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <style>{`
          .blob {
            position: fixed;
            border-radius: 9999px;
            pointer-events: none;
            z-index: 0;
            will-change: transform;
          }

          .blob-1 {
            width: 600px;
            height: 600px;
            background: #6a49fa;
            top: -200px;
            left: -200px;
            filter: blur(140px);
            opacity: 0.55;
            animation: blob-drift-1 14s ease-in-out infinite alternate;
          }

          .blob-2 {
            width: 500px;
            height: 500px;
            background: #c6e6ff;
            bottom: -120px;
            right: -120px;
            filter: blur(130px);
            opacity: 0.25;
            animation: blob-drift-2 18s ease-in-out infinite alternate;
          }

          .blob-3 {
            width: 480px;
            height: 480px;
            background: #fedada;
            bottom: 5%;
            right: 5%;
            filter: blur(120px);
            opacity: 0.38;
            animation: blob-drift-3 12s ease-in-out infinite alternate;
          }

          @keyframes blob-drift-1 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(50px, 70px) scale(1.15); }
          }
          @keyframes blob-drift-2 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(-60px, -50px) scale(1.10); }
          }
          @keyframes blob-drift-3 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(40px, -60px) scale(0.92); }
          }
        `}</style>

        {/* Completion Toast */}
        {completionToast && (
          <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            {completionToast}
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">
            Personal Finance Overview
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            Monitor your balance, savings progress, and financial trends.
          </p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 space-y-5"
          >
            {/* Stats */}
            <DashboardStats
              stats={stats}
              formatCurrency={formatCurrency}
            />

            {/* Savings Cards — gradient fills */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Cash — lavender gradient */}
              <div className="relative overflow-hidden rounded-3xl p-6 shadow-[0_12px_40px_rgba(106,73,250,0.20)]"
                style={{ background: "linear-gradient(135deg, #E2D9FF 0%, #C4B5FD 100%)" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
                <p className="relative z-10 text-sm font-medium text-[#2D1B6B]/65">
                  Cash Savings
                </p>
                <h2 className="relative z-10 mt-2 text-3xl font-bold tracking-tight text-[#2D1B6B]">
                  {formatCurrency(dashboardData.cashSavings)}
                </h2>
              </div>

              {/* Gold — pink gradient */}
              <div className="relative overflow-hidden rounded-3xl p-6 shadow-[0_12px_40px_rgba(232,160,160,0.20)]"
                style={{ background: "linear-gradient(135deg, #FEDADA 0%, #E8A0A0 100%)" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
                <p className="relative z-10 text-sm font-medium text-[#4A1818]/65">
                  Gold Savings
                </p>
                <h2 className="relative z-10 mt-2 text-3xl font-bold tracking-tight text-[#4A1818]">
                  {formatCurrency(dashboardData.goldSavings)}
                </h2>
              </div>
            </section>

            <SavingsGoalsCarousel goals={goals} />

            {/* Add Goal */}
            <section
              className="relative overflow-hidden rounded-3xl
              border border-white/10
              bg-white/5
              p-6
              backdrop-blur-2xl
              shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Add Savings Goal
                  </h2>
                  <p className="mt-0.5 text-sm text-white/45">
                    Set a new target and track your financial progress.
                  </p>
                </div>

                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Goal name"
                  className="w-full rounded-2xl border border-white/10
                  bg-white/6
                  px-4 py-3 text-sm text-white
                  outline-none placeholder:text-white/30
                  backdrop-blur-xl transition
                  focus:border-[#6A49FA]/60
                  focus:bg-white/10
                  focus:ring-2 focus:ring-[#6A49FA]/20"
                />

                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Target amount (RM)"
                  className="w-full rounded-2xl border border-white/10
                  bg-white/6
                  px-4 py-3 text-sm text-white
                  outline-none placeholder:text-white/30
                  backdrop-blur-xl transition
                  focus:border-[#6A49FA]/60
                  focus:bg-white/10
                  focus:ring-2 focus:ring-[#6A49FA]/20"
                />

                <button
                  onClick={handleAddGoal}
                  className="w-full rounded-full
                  bg-linear-to-r from-[#6A49FA] to-[#9B7FFF]
                  px-5 py-3 text-sm font-semibold text-white
                  transition-all duration-200
                  hover:scale-[1.02]
                  hover:shadow-[0_12px_32px_rgba(106,73,250,0.55)]
                  active:scale-[0.98]
                  shadow-[0_8px_24px_rgba(106,73,250,0.40)]"
                >
                  Add Goal
                </button>
              </div>
            </section>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/10
                bg-white/5
                p-5
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                <ExpenseCategoryChart data={dashboardData.expenseByCategory} />
              </div>

              <div
                className="relative overflow-hidden rounded-3xl
                border border-white/10
                bg-white/5
                p-5
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                <IncomeExpenseBarChart data={dashboardData.incomeExpenseSummary} />
              </div>
            </div>

            {/* Monthly Trend */}
            <div
              className="relative overflow-hidden rounded-3xl
              border border-white/10
              bg-white/5
              p-5
              backdrop-blur-2xl
              shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <MonthlyTrendChart data={dashboardData.monthlyTrend} />
            </div>
          </motion.div>
        )}
      </>
    </PageContainer>
  );
}