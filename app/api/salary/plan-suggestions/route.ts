import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Active commitments this month
  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const commitments = await prisma.commitment.findMany({
    where: { userId, isActive: true },
    orderBy: { amount: "desc" },
  });

  // Active savings goals with monthly contribution
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: {
      userId,
      isArchived: false,
      monthlyContribution: { gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  // Active debts with monthly payment
  const debts = await prisma.debt.findMany({
    where: { userId, status: "ACTIVE", monthlyPayment: { gt: 0 } },
    orderBy: { monthlyPayment: "desc" },
  });

  // Active investments with monthly contribution
  const investments = await prisma.investment.findMany({
    where: {
      userId,
      status: "ACTIVE",
      monthlyContribution: { gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    commitments: commitments.map((c) => ({
      id:         c.id,
      label:      c.name,
      amount:     c.amount,
      sourceType: "COMMITMENT",
      sourceId:   c.id,
    })),
    savings: savingsGoals.map((g) => ({
      id:         g.id,
      label:      g.name,
      amount:     g.monthlyContribution!,
      sourceType: "SAVINGS",
      sourceId:   g.id,
    })),
    debts: debts.map((d) => ({
      id:         d.id,
      label:      d.name,
      amount:     d.monthlyPayment,
      sourceType: "DEBT",
      sourceId:   d.id,
    })),
    investments: investments.map((i) => ({
      id:         i.id,
      label:      i.name,
      amount:     i.monthlyContribution,
      sourceType: "INVESTMENT",
      sourceId:   i.id,
    })),
  });
}