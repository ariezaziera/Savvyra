import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { savingsGoalSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    include: {
      transactions: {
        where: { type: "SAVINGS" },
        select: { amount: true },
      },
    },
  });

  const result = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.transactions.reduce((sum, t) => sum + t.amount, 0),
    deadline: goal.deadline,
    monthlyContribution: goal.monthlyContribution ?? null,
    savingsAccountId: goal.savingsAccountId,
    isArchived: goal.isArchived,
    note: goal.note,
    createdAt: goal.createdAt,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = savingsGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, targetAmount, deadline, monthlyContribution } = parsed.data;

  const goal = await prisma.savingsGoal.create({
    data: {
      userId, name, targetAmount,
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      monthlyContribution: monthlyContribution ?? null,
      savingsAccountId: body.savingsAccountId ?? null,
    },
  });

  return NextResponse.json({ ...goal, currentAmount: 0 });
}

export async function PUT(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const existing = await prisma.savingsGoal.findFirst({ where: { id: body.id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TOP UP flow — create a SAVINGS transaction, no direct currentAmount update
  if (body.topUpAmount !== undefined) {
    const topUpAmount = Number(body.topUpAmount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return NextResponse.json({ error: "Invalid top up amount" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title:        `Top Up — ${existing.name}`,
        category:     "Savings",
        amount:       topUpAmount,
        type:         "SAVINGS",
        date:         new Date(),
        savingsGoalId: existing.id,
      },
    });

    // Return updated goal with recomputed currentAmount
    const allTx = await prisma.transaction.findMany({
      where: { savingsGoalId: existing.id, type: "SAVINGS" },
      select: { amount: true },
    });
    const currentAmount = allTx.reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({ ...existing, currentAmount, lastTransaction: transaction });
  }

  // EDIT flow
  const parsed = savingsGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, targetAmount, deadline, monthlyContribution } = parsed.data;

  const goal = await prisma.savingsGoal.update({
    where: { id: body.id },
    data: {
      name, targetAmount,
      deadline: deadline ? new Date(deadline) : null,
      monthlyContribution: monthlyContribution ?? null,
      savingsAccountId: body.savingsAccountId ?? existing.savingsAccountId,
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}