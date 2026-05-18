import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [transactions, goals] = await Promise.all([
      prisma.transaction.findMany({ where: { userId } }),
      prisma.savingsGoal.findMany({
        where: { userId },
        include: {
          transactions: {
            where: { status: "Completed" },
            select: { amount: true },
          },
        },
      }),
    ]);

    // Kira currentAmount setiap goal dari transactions
    const goalsWithProgress = goals.map((goal) => {
      const currentAmount = goal.transactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount,
        deadline: goal.deadline,
      };
    });

    // Total savings = jumlah semua savings goals
    const totalSavings = goalsWithProgress.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );

    // Cash & gold savings = filter by goal name
    const cashSavings = goalsWithProgress
      .filter((g) => g.name.toLowerCase().includes("cash"))
      .reduce((sum, g) => sum + g.currentAmount, 0);

    const goldSavings = goalsWithProgress
      .filter((g) => g.name.toLowerCase().includes("gold"))
      .reduce((sum, g) => sum + g.currentAmount, 0);

    // Income & expenses dari transactions
    const income = transactions
      .filter((t) => t.type.toLowerCase() === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type.toLowerCase() === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Expense by category
    const expenseByCategoryMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type.toLowerCase() === "expense")
      .forEach((t) => {
        const key = (t.category ?? "").trim() || "Uncategorized";
        expenseByCategoryMap[key] =
          (expenseByCategoryMap[key] || 0) + t.amount;
      });

    const expenseByCategory = Object.entries(expenseByCategoryMap).map(
      ([name, value]) => ({ name, value })
    );

    // Income vs expense summary
    const incomeExpenseSummary = [{ name: "Total", income, expenses }];

    // Monthly trend
    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("en-MY", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
      if (t.type.toLowerCase() === "income") {
        monthlyMap[month].income += t.amount;
      } else {
        monthlyMap[month].expenses += t.amount;
      }
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, value]) => ({
      month,
      income: value.income,
      expenses: value.expenses,
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