import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany();

    const income = transactions
      .filter((item) => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const savingsTransactions = transactions.filter(
      (item) =>
        item.type === "Expense" &&
        item.category.toLowerCase().includes("savings")
    );

    const totalSavings = savingsTransactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const cashSavings = savingsTransactions
      .filter((item) =>
        item.category.toLowerCase().includes("cash")
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const goldSavings = savingsTransactions
      .filter((item) =>
        item.category.toLowerCase().includes("gold")
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = income - expenses;

    const expenseByCategoryMap: Record<string, number> = {};

        transactions
        .filter((item) => item.type === "Expense")
        .forEach((item) => {
            const key = item.category.trim();

            if (!expenseByCategoryMap[key]) {
            expenseByCategoryMap[key] = 0;
            }

            expenseByCategoryMap[key] += item.amount;
        });
    
     const expenseByCategory = Object.entries(expenseByCategoryMap).map(
        ([name, value]) => ({
            name,
            value,
        })
    );

    const incomeExpenseSummary = [
    {
        name: "Total",
        income,
        expenses,
    },
    ];

    const monthlyMap: Record<
    string,
    { income: number; expenses: number }
    > = {};

    transactions.forEach((item) => {
    const date = new Date(item.date);

    const month = date.toLocaleString("en-MY", {
        month: "short",
        year: "numeric",
    });

    if (!monthlyMap[month]) {
        monthlyMap[month] = { income: 0, expenses: 0 };
    }

    if (item.type === "Income") {
        monthlyMap[month].income += item.amount;
    } else {
        monthlyMap[month].expenses += item.amount;
    }
    });

    const monthlyTrend = Object.entries(monthlyMap).map(
    ([month, value]) => ({
        month,
        income: value.income,
        expenses: value.expenses,
    })
    );

    const goals = await prisma.savingsGoal.findMany();

    const goalsWithProgress = goals.map((goal) => {
      const current = transactions
        .filter((item) => item.savingsGoalId === goal.id)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        id: goal.id,
        name: goal.name,
        category: goal.category,
        target: goal.target,
        current,
        deadline: goal.deadline,
        note: goal.note,
      };
    });

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