"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import SavingsGoalsSection from "@/components/SavingsGoalsSection";
import PageContainer from "@/components/PageContainer";
import { savingsGoals } from "@/lib/dashboardData";
import { formatCurrency } from "@/lib/formatCurrency";
import ExpenseCategoryChart from "@/components/ExpenseCategoryChart";
import IncomeExpenseBarChart from "@/components/IncomeExpenseBarChart";

type DashboardData = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  expenseByCategory: { name: string; value: number }[];
  incomeExpenseSummary: { name: string; income: number; expenses: number }[];
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    expenseByCategory: [],
    incomeExpenseSummary: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      const response = await fetch("/api/dashboard");
      const data = await response.json();

      setDashboardData(data);
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
      label: "Savings",
      value: dashboardData.savings,
      color: "text-purple-600",
    },
  ];

  return (
    <PageContainer>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Savvyra Dashboard
      </h1>

      <DashboardStats stats={stats} formatCurrency={formatCurrency} />

      <div className="mt-6">
        <ExpenseCategoryChart data={dashboardData.expenseByCategory} />
      </div>

      <div className="mt-6">
        <IncomeExpenseBarChart data={dashboardData.incomeExpenseSummary} />
      </div>

      <SavingsGoalsSection
        savingsGoals={savingsGoals}
        formatCurrency={formatCurrency}
      />
    </PageContainer>
  );
}