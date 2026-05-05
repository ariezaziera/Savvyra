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
  incomeExpenseSummary: { name: string; income: number; expenses: number }[];
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
    const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
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
      color: "text-blue-600",
    },
    {
      label: "Income",
      value: dashboardData.income,
      color: "text-green-600",
    },
    {
      label: "Expenses",
      value: dashboardData.expenses,
      color: "text-red-500",
    },
    {
      label: "Total Savings",
      value: dashboardData.savings,
      color: "text-purple-600",
    },
    
  ];
  

  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) return;

    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: goalName, targetAmount: goalTarget, currentAmount: 0, deadline: null }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to add goal:", error);
    } else {
      const newGoal = await res.json();
      console.log("Added goal:", newGoal);
      setGoalName("");
      setGoalTarget("");
      await fetchDashboard();
    }

    setGoalName("");
    setGoalTarget("");
    await fetchDashboard();
  };

  return (
    <PageContainer>
      {completionToast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg animate-bounce">
          {completionToast}
        </div>
      )}
      
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Savvyra Dashboard
      </h1>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <DashboardStats stats={stats} formatCurrency={formatCurrency} />

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Cash Savings</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardData.cashSavings)}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Gold Savings</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardData.goldSavings)}
              </h2>
            </div>
          </section>

          <SavingsGoalsCarousel goals={goals} />

          <section className="rounded-2xl border border-gray-200 bg-white p-5 pt-0 shadow-sm">
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Savings Goal
              </h2>
              <p className="text-sm text-gray-500">
                Set a new goal and start tracking your progress
              </p>
              <input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Goal name"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target amount"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleAddGoal}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Add Goal
              </button>
            </div>
          </section>
          
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExpenseCategoryChart data={dashboardData.expenseByCategory} />

            <IncomeExpenseBarChart data={dashboardData.incomeExpenseSummary} />
          </div>

          <div className="mt-6">
            <MonthlyTrendChart data={dashboardData.monthlyTrend} />
          </div>
        </motion.div>
        
      )}
    </PageContainer>
  );
}