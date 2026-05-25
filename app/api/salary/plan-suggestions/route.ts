import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "0");
  const year  = parseInt(searchParams.get("year")  ?? "0");

  // Active commitments
  const commitments = await prisma.commitment.findMany({
    where: { userId, isPaid: false },
    orderBy: { amount: "desc" },
  });

  // Active savings goals with monthly contribution
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: {
      userId,
      monthlyContribution: { not: null, gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  // Active debts
  const debts = await prisma.debt.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { monthlyPayment: "desc" },
  });

  // Active investments with monthly contribution
  const investments = await prisma.investment.findMany({
    where: {
      userId,
      status: "ACTIVE",
      monthlyContribution: { not: null, gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    commitments: commitments.map((c) => ({
      id:       c.id,
      label:    c.name,
      amount:   c.amount,
      category: "commitments",
      source:   "commitment",
      sourceId: c.id,
    })),
    savings: savingsGoals.map((g) => ({
      id:       g.id,
      label:    g.name,
      amount:   g.monthlyContribution!,
      category: "savings",
      source:   "savingsGoal",
      sourceId: g.id,
    })),
    debts: debts.map((d) => ({
      id:       d.id,
      label:    d.name,
      amount:   d.monthlyPayment,
      category: "debts",
      source:   "debt",
      sourceId: d.id,
    })),
    investments: investments.map((i) => ({
      id:       i.id,
      label:    i.name,
      amount:   i.monthlyContribution!,
      category: "investment",
      source:   "investment",
      sourceId: i.id,
    })),
  });
}