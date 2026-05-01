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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/dashboard");
        const data = await response.json();

        setDashboardData(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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

  const savingsGoals = [
    { name: "Emergency Fund", current: 1200, target: 3000 },
    { name: "Car Service", current: 300, target: 700 },
    { name: "Convo Savings", current: 990, target: 1000 },
    { name: "Birthday Savings", current: 200, target: 200 },
    { name: "Insurance Savings", current: 2000, target: 5000 },
  ];

  return (
    <PageContainer>
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

          <SavingsGoalsCarousel goals={savingsGoals} />

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