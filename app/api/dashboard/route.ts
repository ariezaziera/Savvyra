import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({ where: { userId } });

    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const savingsTransactions = transactions.filter(
      (item) =>
        item.type === "expense" &&
        item.description.toLowerCase().includes("savings")
    );

    const totalSavings = savingsTransactions.reduce((sum, item) => sum + item.amount, 0);

    const cashSavings = savingsTransactions
      .filter((item) => item.description.toLowerCase().includes("cash"))
      .reduce((sum, item) => sum + item.amount, 0);

    const goldSavings = savingsTransactions
      .filter((item) => item.description.toLowerCase().includes("gold"))
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = income - expenses;

    const expenseByCategoryMap: Record<string, number> = {};
    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const key = item.description.trim();
        expenseByCategoryMap[key] = (expenseByCategoryMap[key] || 0) + item.amount;
      });

    const expenseByCategory = Object.entries(expenseByCategoryMap).map(
      ([name, value]) => ({ name, value })
    );

    const incomeExpenseSummary = [{ name: "Total", income, expenses }];

    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((item) => {
      const month = new Date(item.date).toLocaleString("en-MY", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
      if (item.type === "income") {
        monthlyMap[month].income += item.amount;
      } else {
        monthlyMap[month].expenses += item.amount;
      }
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, value]) => ({
      month,
      income: value.income,
      expenses: value.expenses,
    }));

    const goals = await prisma.savingsGoal.findMany({ where: { userId } });

    const goalsWithProgress = goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
    }));

    return NextResponse.json({
      balance,
      income,
      expenses,
      savings: totalSavings,
      cashSavings,
      goldSavings,
      expenseByCategory,
      incomeExpenseSummary,
      monthlyTrend,
      goals: goalsWithProgress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}