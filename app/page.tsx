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
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import QuickActions from "@/components/QuickActions";
import { signOut } from "next-auth/react";
import NotificationBell from "@/components/NotificationBell";
import { LogOut } from "lucide-react";
import { exportDashboardPDF } from "@/lib/exportUtils";

type ChartData = {
  name: string;
  income: number;
  expenses: number;
};

type MonthlyTrendData = {
  month: string;
  income: number;
  expenses: number;
};

type DashboardData = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  cashSavings: number;
  goldSavings: number;
  expenseByCategory: { name: string; value: number }[];
  incomeExpenseSummary: ChartData[];
  monthlyTrend: MonthlyTrendData[];
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(name: string | null | undefined) {
  if (!name) return "there";
  return name.split(" ")[0];
}

export default function Home() {
  const { user } = useUser();

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

  const [isLoading, setIsLoading]           = useState(true);
  const [isExporting, setIsExporting]       = useState(false);
  const [completionToast, setCompletionToast] = useState("");
  const [goals, setGoals]                   = useState<any[]>([]);
  const [goalName, setGoalName]             = useState("");
  const [goalTarget, setGoalTarget]         = useState("");

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [dashboardRes, goalsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/savings-goals"),
      ]);
      const data      = await dashboardRes.json();
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
      const progress   = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
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
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name:          goalName,
        targetAmount:  goalTarget,
        currentAmount: 0,
        deadline:      null,
      }),
    });
    if (!res.ok) {
      console.error("Failed to add goal:", await res.json());
    } else {
      setGoalName("");
      setGoalTarget("");
      await fetchDashboard();
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportDashboardPDF(dashboardData, user?.name ?? "User");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <>
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
            width: 600px; height: 600px;
            background: #6a49fa;
            top: -200px; left: -200px;
            filter: blur(140px); opacity: 0.55;
            animation: blob-drift-1 14s ease-in-out infinite alternate;
          }
          .blob-2 {
            width: 500px; height: 500px;
            background: #c6e6ff;
            bottom: -120px; right: -120px;
            filter: blur(130px); opacity: 0.25;
            animation: blob-drift-2 18s ease-in-out infinite alternate;
          }
          .blob-3 {
            width: 480px; height: 480px;
            background: #fedada;
            bottom: 5%; right: 5%;
            filter: blur(120px); opacity: 0.38;
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
          .export-btn {
            padding: 8px 16px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.08);
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            transition: background 0.15s ease, transform 0.15s ease;
          }
          .export-btn:hover:not(:disabled) {
            background: rgba(196,181,253,0.15);
            transform: scale(1.02);
          }
          .export-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }
        `}</style>

        {/* Completion Toast */}
        {completionToast && (
          <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            {completionToast}
          </div>
        )}

        {/* ── Header ── */}
        <div className="relative z-10 mb-8">

          {/* Mobile top bar */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 backdrop-blur-xl"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>

            <NotificationBell />

            <Link href="/profile">
              <div className="relative group">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? "Profile"}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shadow-lg transition group-hover:border-[#C4B5FD]/60"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg bg-linear-to-br from-[#6A49FA] to-[#C4B5FD] transition group-hover:border-[#C4B5FD]/60">
                    <span className="text-sm font-bold text-white">
                      {getFirstName(user?.name)?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#8EE3B5] border-2 border-[#1a1035]" />
              </div>
            </Link>
          </div>

          {/* Greeting row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">
                Personal Finance Overview
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
                {getGreeting()}, {getFirstName(user?.name)} 👋
              </h1>
              <p className="mt-1.5 text-sm text-white/50">
                Monitor your balance, savings progress, and financial trends.
              </p>
            </div>

            {/* Desktop right — export + notification + avatar */}
            <div className="shrink-0 mt-2 hidden md:flex items-center gap-3 z-10">
              <NotificationBell />
              <Link href="/profile">
                <div className="relative group">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? "Profile"}
                      className="h-11 w-11 rounded-full object-cover border-2 border-white/20 shadow-lg transition group-hover:border-[#C4B5FD]/60"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg bg-linear-to-br from-[#6A49FA] to-[#C4B5FD] transition group-hover:border-[#C4B5FD]/60">
                      <span className="text-base font-bold text-white">
                        {getFirstName(user?.name)?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#8EE3B5] border-2 border-[#1a1035]" />
                </div>
              </Link>
            </div>
          </div>
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
            {/* Quick Actions */}
            <QuickActions />

            {/* Export */}
            {!isLoading && (
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="export-btn"
                >
                  {isExporting ? "⏳ Exporting…" : "🖨 Export Summary"}
                </button>
              )}

            <DashboardStats stats={stats} formatCurrency={formatCurrency} />

            <div className="-mx-1 px-1 py-1">
              <SavingsGoalsCarousel goals={goals} />
            </div>

            {/* Add Goal */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Savings Goal</h2>
                  <p className="mt-0.5 text-sm text-white/45">
                    Set a new target and track your financial progress.
                  </p>
                </div>
                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Goal name"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20"
                />
                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Target amount (RM)"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20"
                />
                <button
                  onClick={handleAddGoal}
                  className="w-full rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(106,73,250,0.55)] active:scale-[0.98] shadow-[0_8px_24px_rgba(106,73,250,0.40)]"
                >
                  Add Goal
                </button>
              </div>
            </section>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                <ExpenseCategoryChart data={dashboardData.expenseByCategory} />
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                <IncomeExpenseBarChart data={dashboardData.incomeExpenseSummary} />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <MonthlyTrendChart data={dashboardData.monthlyTrend} />
            </div>

            {/* Mobile export button — bottom of page */}
            <div className="flex justify-center pb-4 md:hidden">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="export-btn"
              >
                {isExporting ? "⏳ Exporting…" : "🖨 Export PDF"}
              </button>
            </div>
          </motion.div>
        )}
      </>
    </PageContainer>
  );
}