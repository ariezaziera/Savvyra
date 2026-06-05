import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now        = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();

    const [transactions, goals, debts, commitmentInstances, investments, salaryProfile] = await Promise.all([
      // All transactions for ledger calculations
      prisma.transaction.findMany({ where: { userId } }),

      // Savings goals — current amount derived from transactions
      prisma.savingsGoal.findMany({
        where: { userId, isArchived: false },
        include: {
          transactions: { where: { type: "SAVINGS" }, select: { amount: true } },
        },
      }),

      // Active debts
      prisma.debt.findMany({
        where: { userId, status: "ACTIVE" },
        include: {
          schedules: {
            where: { status: { in: ["PENDING", "OVERDUE"] } },
            orderBy: { dueDate: "asc" },
            take: 1,
          },
        },
      }),

      // Current month commitment instances
      prisma.commitmentInstance.findMany({
        where: { userId, month: currentMonth, year: currentYear },
        include: { commitment: true },
        orderBy: { dueDate: "asc" },
      }),

      // Active investments
      prisma.investment.findMany({
        where: { userId, status: "ACTIVE" },
        include: {
          transactions: { where: { type: "INVESTMENT" }, select: { amount: true } },
        },
      }),

      prisma.salaryProfile.findUnique({ where: { userId } }),
    ]);

    // ── Transactions ──────────────────────────────────────────────
    const income   = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => ["EXPENSE", "COMMITMENT", "DEBT_PAYMENT", "SAVINGS", "INVESTMENT"].includes(t.type))
      .reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;

    const expenseByCategoryMap: Record<string, number> = {};
    transactions
      .filter((t) => ["EXPENSE", "COMMITMENT", "DEBT_PAYMENT"].includes(t.type))
      .forEach((t) => {
        const key = (t.category ?? "").trim() || "Uncategorized";
        expenseByCategoryMap[key] = (expenseByCategoryMap[key] || 0) + t.amount;
      });
    const expenseByCategory = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value }));

    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("en-MY", { month: "short", year: "numeric" });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
      if (t.type === "INCOME") monthlyMap[month].income += t.amount;
      else monthlyMap[month].expenses += t.amount;
    });
    const monthlyTrend = Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v }));

    // ── Savings ───────────────────────────────────────────────────
    const goalsWithProgress = goals.map((g) => {
      const currentAmount = g.transactions.reduce((s, t) => s + t.amount, 0);
      return { id: g.id, name: g.name, targetAmount: g.targetAmount, currentAmount, deadline: g.deadline };
    });
    const totalSavings = goalsWithProgress.reduce((s, g) => s + g.currentAmount, 0);

    // ── Debts ─────────────────────────────────────────────────────
    const totalDebtRemaining    = debts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalDebtOriginal     = debts.reduce((s, d) => s + d.totalAmount, 0);
    const totalMonthlyRepayment = debts.reduce((s, d) => s + (d.monthlyPayment || 0), 0);
    const debtPaidPct = totalDebtOriginal > 0
      ? Math.round(((totalDebtOriginal - totalDebtRemaining) / totalDebtOriginal) * 100)
      : 0;

    // Next upcoming debt schedule payment
    const nextDebtPayment = debts
      .flatMap((d) => d.schedules.map((s) => ({ name: d.name, date: s.dueDate, amount: s.amount })))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

    // ── Commitments this month ────────────────────────────────────
    const paidInstances   = commitmentInstances.filter((i) => i.status === "PAID");
    const unpaidInstances = commitmentInstances.filter((i) => i.status !== "PAID");
    const overdueInstances = unpaidInstances.filter((i) => new Date(i.dueDate) < now);
    const totalCommitmentsAmt = commitmentInstances.reduce((s, i) => s + i.amount, 0);
    const paidCommitmentsAmt  = paidInstances.reduce((s, i) => s + i.amount, 0);
    const nextDueInstance     = unpaidInstances[0] ?? null;

    // ── Investments — balance derived from transactions ───────────
    const investmentsWithValue = investments.map((inv) => {
      const totalFunded = inv.transactions.reduce((s, t) => s + t.amount, 0);
      return { ...inv, currentValue: totalFunded };
    });
    const totalInvested     = investmentsWithValue.reduce((s, i) => s + i.currentValue, 0);
    const totalCurrentValue = totalInvested; // gain/loss tracking via returnRate handled per investment

    // ── Net Worth ─────────────────────────────────────────────────
    const netWorth = totalSavings + totalCurrentValue - totalDebtRemaining;

    // ── Salary ────────────────────────────────────────────────────
    const salaryDay = salaryProfile?.salaryDay ?? null;
    let nextSalaryDate: Date | null = null;
    if (salaryDay) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), salaryDay);
      nextSalaryDate  = candidate > now ? candidate : new Date(now.getFullYear(), now.getMonth() + 1, salaryDay);
    }

    return NextResponse.json({
      balance,
      income,
      expenses,
      savings: totalSavings,
      expenseByCategory,
      incomeExpenseSummary: [{ name: "Total", income, expenses }],
      monthlyTrend,
      goals: goalsWithProgress,
      netWorth,
      debt: {
        totalRemaining:   totalDebtRemaining,
        totalOriginal:    totalDebtOriginal,
        paidPct:          debtPaidPct,
        monthlyRepayment: totalMonthlyRepayment,
        nextPayment:      nextDebtPayment,
        count:            debts.length,
      },
      commitments: {
        total:       commitmentInstances.length,
        paid:        paidInstances.length,
        unpaid:      unpaidInstances.length,
        overdue:     overdueInstances.length,
        totalAmount: totalCommitmentsAmt,
        paidAmount:  paidCommitmentsAmt,
        nextDue:     nextDueInstance
          ? { name: nextDueInstance.commitment.name, date: nextDueInstance.dueDate, amount: nextDueInstance.amount }
          : null,
        overdueList: overdueInstances.map((i) => ({
          name:    i.commitment.name,
          amount:  i.amount,
          dueDate: i.dueDate,
        })),
      },
      investments: {
        totalInvested,
        totalCurrentValue,
        gainLoss:    0,
        gainLossPct: 0,
        count:       investments.length,
      },
      salary: {
        basicSalary:    salaryProfile?.basicSalary ?? null,
        nextSalaryDate: nextSalaryDate,
        salaryDay,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
