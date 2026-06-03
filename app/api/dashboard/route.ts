import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now       = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [transactions, goals, debts, commitments, investments, salaryProfile] = await Promise.all([
      prisma.transaction.findMany({ where: { userId } }),
      prisma.savingsGoal.findMany({
        where: { userId },
        include: { transactions: { where: { status: "Completed" }, select: { amount: true } } },
      }),
      prisma.debt.findMany({ where: { userId, status: "ACTIVE" }, orderBy: { nextPaymentDate: "asc" } }),
      prisma.commitment.findMany({
        where: { userId, dueDate: { gte: monthStart, lte: monthEnd } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.investment.findMany({ where: { userId, status: "ACTIVE" } }),
      prisma.salaryProfile.findUnique({ where: { userId } }),
    ]);

    // ── Transactions ──────────────────────────────────────────────
    const income   = transactions.filter((t) => t.type.toLowerCase() === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type.toLowerCase() === "expense").reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;

    const expenseByCategoryMap: Record<string, number> = {};
    transactions.filter((t) => t.type.toLowerCase() === "expense").forEach((t) => {
      const key = (t.category ?? "").trim() || "Uncategorized";
      expenseByCategoryMap[key] = (expenseByCategoryMap[key] || 0) + t.amount;
    });
    const expenseByCategory = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value }));

    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("en-MY", { month: "short", year: "numeric" });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
      if (t.type.toLowerCase() === "income") monthlyMap[month].income += t.amount;
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
    const totalDebtRemaining  = debts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalDebtOriginal   = debts.reduce((s, d) => s + d.totalAmount, 0);
    const totalMonthlyRepayment = debts.reduce((s, d) => s + (d.monthlyPayment || 0), 0);
    const nextDebtPayment     = debts.find((d) => d.nextPaymentDate)
      ? { name: debts.find((d) => d.nextPaymentDate)!.name, date: debts.find((d) => d.nextPaymentDate)!.nextPaymentDate, amount: debts.find((d) => d.nextPaymentDate)!.monthlyPayment }
      : null;
    const debtPaidPct = totalDebtOriginal > 0 ? Math.round(((totalDebtOriginal - totalDebtRemaining) / totalDebtOriginal) * 100) : 0;

    // ── Commitments this month ────────────────────────────────────
    const paidCommitments   = commitments.filter((c) => c.isPaid);
    const unpaidCommitments = commitments.filter((c) => !c.isPaid);
    const overdueCommitments = unpaidCommitments.filter((c) => new Date(c.dueDate) < now);
    const totalCommitmentsAmt = commitments.reduce((s, c) => s + c.amount, 0);
    const paidCommitmentsAmt  = paidCommitments.reduce((s, c) => s + c.amount, 0);
    const nextDueCommitment   = unpaidCommitments[0] ?? null;

    // ── Investments ───────────────────────────────────────────────
    const totalInvested      = investments.reduce((s, i) => s + i.principalAmount, 0);
    const totalCurrentValue  = investments.reduce((s, i) => s + (i.currentValue || i.principalAmount), 0);
    const investmentGainLoss = totalCurrentValue - totalInvested;

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
      // existing
      balance, income, expenses,
      savings: totalSavings,
      cashSavings: totalSavings,
      goldSavings: 0,
      expenseByCategory,
      incomeExpenseSummary: [{ name: "Total", income, expenses }],
      monthlyTrend,
      goals: goalsWithProgress,

      // new
      netWorth,
      debt: {
        totalRemaining: totalDebtRemaining,
        totalOriginal:  totalDebtOriginal,
        paidPct:        debtPaidPct,
        monthlyRepayment: totalMonthlyRepayment,
        nextPayment:    nextDebtPayment,
        count:          debts.length,
      },
      commitments: {
        total:         commitments.length,
        paid:          paidCommitments.length,
        unpaid:        unpaidCommitments.length,
        overdue:       overdueCommitments.length,
        totalAmount:   totalCommitmentsAmt,
        paidAmount:    paidCommitmentsAmt,
        nextDue:       nextDueCommitment ? { name: nextDueCommitment.name, date: nextDueCommitment.dueDate, amount: nextDueCommitment.amount } : null,
        overdueList:   overdueCommitments.map((c) => ({ name: c.name, amount: c.amount, dueDate: c.dueDate })),
      },
      investments: {
        totalInvested,
        totalCurrentValue,
        gainLoss:   investmentGainLoss,
        gainLossPct: totalInvested > 0 ? Math.round((investmentGainLoss / totalInvested) * 100 * 10) / 10 : 0,
        count:      investments.length,
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
